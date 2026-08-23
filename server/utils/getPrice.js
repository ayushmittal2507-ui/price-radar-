import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Scrapes product/stock details from the given URL using Site selectors.
 * Throws selector-specific custom errors if parsing fails.
 *
 * @param {string} url 
 * @param {object} site 
 * @returns {Promise<{name: string, price: number, image: string}>}
 */
export const getPrice = async (url, site) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    const nameText = $(site.nameLocation).first().text().trim();
    const priceText = $(site.priceLocation).first().text().trim();
    
    const imageEl = $(site.imageLocation).first();
    const image = imageEl.attr('src') || imageEl.attr('data-old-hires') || imageEl.attr('data-src') || '';

    if (!nameText) {
      throw new Error(`SELECTOR_NOT_FOUND: Name element (selector: "${site.nameLocation}") not found on ${site.name}`);
    }
    if (!priceText) {
      throw new Error(`SELECTOR_NOT_FOUND: Price element (selector: "${site.priceLocation}") not found on ${site.name}`);
    }

    // Process price
    let cleanedPrice = priceText.replace(/[^\d.]/g, '');
    
    // Handle cases where comma is used as decimal separator (standard in some European locales)
    // or if we have multiple decimal points.
    const priceParts = cleanedPrice.split('.');
    if (priceParts.length > 2) {
      const decimal = priceParts.pop();
      cleanedPrice = priceParts.join('') + '.' + decimal;
    }

    let price = parseFloat(cleanedPrice);
    if (isNaN(price)) {
      throw new Error(`SELECTOR_NOT_FOUND: Failed to parse price "${priceText}" into a valid float on ${site.name}`);
    }

    price = parseFloat(price.toFixed(2));

    return {
      name: nameText,
      price,
      image,
    };
  } catch (error) {
    if (error.message.startsWith('SELECTOR_NOT_FOUND:')) {
      throw error;
    }
    throw new Error(`Scraping failed: ${error.message}`);
  }
};
