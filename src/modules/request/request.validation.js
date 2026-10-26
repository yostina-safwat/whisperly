import Joi from "joi";
import { RequestStatus } from "../../DB/models/request.model.js";

const objectId = Joi.string().hex().length(24);

export const sendRequestSchema = {
  params: Joi.object({ receiverId: objectId.required() }),
};

export const requestIdSchema = {
  params: Joi.object({ id: objectId.required() }),
};

export const respondToRequestSchema = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    status: Joi.string()
      .valid(RequestStatus.ACCEPTED, RequestStatus.REJECTED)
      .required(),
  }),
};
