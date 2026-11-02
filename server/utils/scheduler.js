import cron from 'node-cron';
import mongoose from 'mongoose';
import Track from '../models/TrackModel.js';
import { getPrice } from './getPrice.js';
import { sendMail } from './sendMail.js';
import { sendTelegramMessage } from './sendTelegram.js';

export const runPriceCheck = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  console.log('⏳ Running periodic price check job...');
  try {
    // Find all tracks that have not alerted yet
    const tracks = await Track.find({ informed: false })
      .populate('user', 'email name')
      .populate('site');

    for (const track of tracks) {
      try {
        console.log(`Checking price for "${track.name}" (${track.url})`);
        
        // Fetch current scraped details
        const scraped = await getPrice(track.url, track.site);
        const price = scraped.price;
        
        // Add to tracking history
        track.history.push({ price, date: new Date() });

        // Update lowest price ever seen
        if (track.lowestPriceEver === null || price < track.lowestPriceEver) {
          track.lowestPriceEver = price;
        }

        // If target met, dispatch notifications
        if (price <= track.demandPrice) {
          console.log(`🎯 Target met for "${track.name}" (${price} <= ${track.demandPrice})!`);
          
          const subject = `🎯 Price Radar Alert: ${track.name} is now $${price}!`;
          const text = `Hi ${track.user.name},\n\nGood news! The price of "${track.name}" has dropped to $${price}, which meets your target price of $${track.demandPrice}.\n\nBuy it now here: ${track.url}\n\nHappy saving!\n- PriceRadar Team`;
          
          const html = `
            <div style="font-family: sans-serif; padding: 25px; background-color: #faf9f6; border: 2px solid #e1ded3; border-radius: 6px; max-width: 600px; margin: auto;">
              <h2 style="color: #1e4620; margin-top: 0;">🎯 Target Met! Price Drop Detected</h2>
              <p>Hi <strong>${track.user.name}</strong>,</p>
              <p>One of the items on your PriceRadar watchlist has hit your target alert threshold.</p>
              
              <div style="background-color: #f1efe4; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">${track.name}</h3>
                <p style="margin: 5px 0;">🎯 <b>Target Price:</b> $${track.demandPrice}</p>
                <p style="margin: 5px 0; color: #1e4620; font-size: 1.2em;">🔥 <b>Current Price:</b> $${price}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${track.url}" style="background-color: #1e4620; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Purchase / View Item</a>
              </div>

              <hr style="border: 0; border-top: 1px solid #dcd9ca; margin: 20px 0;" />
              <p style="font-size: 0.85em; color: #777; margin-bottom: 0;">You will not receive any more alerts for this specific track unless you toggle it active again in your dashboard settings.</p>
            </div>
          `;

          // Send Email
          await sendMail(track.user.email, subject, text, html);

          // Send Telegram if chat ID exists
          if (track.telegramChatId) {
            const telegramMsg = `🎯 <b>Price Alert!</b>\n\nYour tracked product <b>${track.name}</b> has dropped to <b>$${price}</b> (Target: $${track.demandPrice}).\n\n👉 <a href="${track.url}">Purchase / View Item</a>`;
            await sendTelegramMessage(track.telegramChatId, telegramMsg);
          }

          // Mark user as informed
          track.informed = true;
        }

        // Save scraped image if we didn't have one cached
        if (scraped.image && !track.image) {
          track.image = scraped.image;
        }

        await track.save();
      } catch (trackError) {
        // Individual error handling so one failure doesn't halt the scheduler
        console.error(`❌ Error scraping track ID ${track._id} ("${track.name}"):`, trackError.message);
      }
    }
  } catch (error) {
    console.error('❌ Price check batch error:', error.message);
  }
};

export const startScheduler = () => {
  const cronPattern = process.env.CRON_SCHEDULE || '*/10 * * * *';
  cron.schedule(cronPattern, runPriceCheck);
  console.log(`⏰ Scheduler registered with schedule: "${cronPattern}"`);
};
