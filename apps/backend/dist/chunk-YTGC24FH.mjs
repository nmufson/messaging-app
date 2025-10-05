// src/services/message.ts
var sendMessage = async (prisma, params) => {
  const { chatId, sender, type, content, imageUrl } = params;
  return await prisma.message.create({
    data: {
      type,
      content,
      imageUrl,
      sender: { connect: { id: sender } },
      chat: { connect: { id: chatId } }
    }
  });
};

export {
  sendMessage
};
