import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const sendMessageSchema = {
  params: Joi.object({ receiverId: objectId.required() }),
  body: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
  }),
};

export const messageIdSchema = {
  params: Joi.object({ id: objectId.required() }),
};
