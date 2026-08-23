import Joi from 'joi';
import Track from '../models/TrackModel.js';
import Site from '../models/SiteModel.js';

const trackSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Item name is required',
  }),
  url: Joi.string().uri().required().messages({
    'any.required': 'URL is required',
    'string.uri': 'Please enter a valid URL',
  }),
  site: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'any.required': 'Site ID is required',
    'string.pattern.base': 'Invalid Site ID format',
  }),
  type: Joi.string().valid('product', 'stock').required().messages({
    'any.required': 'Type is required',
    'any.only': 'Type must be either product or stock',
  }),
  demandPrice: Joi.number().positive().required().messages({
    'any.required': 'Demand price is required',
    'number.positive': 'Demand price must be greater than zero',
  }),
  image: Joi.string().allow('', null).optional(),
  telegramChatId: Joi.string().allow('', null).optional(),
});

export const getAllTracks = async (req, res) => {
  try {
    const tracks = await Track.find().populate('user', 'name email').populate('site', 'name');
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTracks = async (req, res) => {
  try {
    const tracks = await Track.find({ user: req.user._id }).populate('site', 'name');
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id).populate('site', 'name');
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    if (track.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this track' });
    }
    res.json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTrack = async (req, res) => {
  try {
    const { error, value } = trackSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const siteExists = await Site.findById(value.site);
    if (!siteExists) {
      return res.status(400).json({ message: 'The referenced Site does not exist' });
    }

    const track = await Track.create({
      ...value,
      user: req.user._id,
    });
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    if (track.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this track' });
    }

    await track.deleteOne();
    res.json({ message: 'Track removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
