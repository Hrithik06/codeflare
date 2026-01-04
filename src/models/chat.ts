import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);
const chatSchema = new mongoose.Schema({
	participants: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: "User",
		required: true,
		validate: [
			{
				validator: (v: mongoose.Types.ObjectId[]) => v.length >= 2,
				message: "At least 2 participants are required",
			},
		],
	},
	messages: [messageSchema],
});
export type Chat = mongoose.InferSchemaType<typeof chatSchema>;
export type Message = mongoose.InferSchemaType<typeof messageSchema>;

export type ChatDocument = mongoose.HydratedDocument<Chat>;
export type MessageDocument = mongoose.HydratedDocument<Message>;

const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);
// const MessageModel = mongoose.model<MessageDocument>("Message", messageSchema);//Not used anywhere as we directly push messages in chat
// Message cannot exist without Chat so we never create Message outside Chat

export default ChatModel;
