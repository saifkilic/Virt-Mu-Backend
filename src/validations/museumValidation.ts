import Joi from 'joi';

export const createMuseumSchema = Joi.object({
  code: Joi.string().valid('lahore', 'taxila', 'national_karachi', 'mohenjo_daro').required(),
  name: Joi.object({
    en: Joi.string().min(3).max(200).required(),
    ur: Joi.string().min(3).max(200).required()
  }).required(),
  slug: Joi.string().required(),
  isUnescoSite: Joi.boolean().default(false)
});