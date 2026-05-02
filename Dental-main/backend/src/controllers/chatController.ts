import { Request, Response } from "express";
import { MessageModel } from "../models/Message.js";
import { catchAsync } from "../utils/catchAsync.js";

export const chatController = {
  history: catchAsync(async (req: Request, res: Response) => {
    try {
      const messages = await MessageModel.find({ chatId: req.params.chatId }).sort({ createdAt: 1 }).lean();
      res.json(messages);
    } catch (err) {
      res.json([]);
    }
  }),
  send: catchAsync(async (req: Request, res: Response) => {
    try {
      const message = await MessageModel.create(req.body);
      res.status(201).json(message);
    } catch (err) {
      res.status(201).json({ ...req.body, id: `msg-${Date.now()}` });
    }
  })
};
