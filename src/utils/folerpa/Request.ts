export interface IWitEntity {
    suggested?: boolean,
    confidence: number,
    value: string,
    type?: string
}

export interface IWitValidation {
    _text: string,
    entities: {
        [entityName: string]: IWitEntity[]
    }
}

export interface IMessageValidation {
    idMessage: number,
    idVersion: number,
    validationDate: string,
    data: IWitValidation
}

export interface IMessage {
    idMessage: number,
    idConversation: number,
    text: string,
    speakText: string,
    type: 1|2|3,
    messageData: string,
    side: 1|2,
    messageValidation: IMessageValidation
}

export interface IConversation {
    idConversation: number,
    idUser: number,
    idVersion: number,
    messages: IMessage[]
}

export interface IRequest {
    conversation: IConversation
}