import { IResponse } from './Response';
import { IRequest } from './Request';
import { Request, Response } from 'express'

export interface IMiddlewareHandler {
    run: (request: IRequest) => IResponse | Promise<IResponse>
}

export class Middleware {
    static create(handlers: IMiddlewareHandler[]) {
        return async (req: Request, res: Response) => {
            const loop = async (i: number = 0) => {
                if (i === handlers.length) {
                    throw new Error('No handler')
                } else {
                    try {
                        const res = await handlers[i].run(req.body)

                        if (res instanceof Object) {
                            return res
                        } else {
                            throw new Error('No object')
                        }
                    } catch (e) {
                        return await loop(i + 1)
                    }
                }
            }

            try {
                const response = await loop()
                res.json(response)
            } catch (e) {
                res.sendStatus(500)
            }
        }
    }
}