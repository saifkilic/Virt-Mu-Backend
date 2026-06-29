import Joi from 'joi';

export const createArtifactSchema = Joi.object({
  roomId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  museumId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  museumCode: Joi.string().valid('lahore', 'taxila', 'national_karachi', 'mohenjo_daro').required(),
  name: Joi.object({
    en: Joi.string().min(3).max(200).required(),
    ur: Joi.string().min(3).max(200).required()
  }).required(),
  description: Joi.object({
    en: Joi.string().min(10).required(),
    ur: Joi.string().min(10).required()
  }).required(),
  category: Joi.string().valid(
    'painting', 'sculpture', 'relief', 'textile', 'metalwork', 
    'jewelry', 'manuscript', 'pottery', 'seal', 'coin', 
    'figurine', 'weapon', 'architectural', 'mummy', 'stone_carving', 'other'
  ).required()
});