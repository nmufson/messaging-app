export declare const usersData: {
    id: string;
    email: string;
    hashedPassword: string;
    role: "USER";
}[];
export declare const profilesData: ({
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string;
    userId: string;
} | {
    id: string;
    firstName: string;
    lastName: string;
    userId: string;
    profilePictureUrl?: undefined;
})[];
export declare const chatsData: {
    id: string;
    creatorId: string;
    type: "DIRECT";
    participantIds: string[];
}[];
export declare const messagesData: {
    id: string;
    type: "TEXT";
    content: string;
    senderId: string;
    chatId: string;
}[];
