import Joi from "joi";

const objectId = Joi.string().hex().length(24);

export const conversationIdSchema = {
  params: Joi.object({ id: objectId.required() }),
};

export const sendConversationMessageSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
  }),
};
