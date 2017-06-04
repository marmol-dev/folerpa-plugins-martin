import { WebPages, Random, Middleware } from '../../utils/folerpa'

export default Middleware.create([
    {
        async run(request) {

            const { intent, alimento } = request.conversation.messages[0].messageValidation.data.entities

            if (intent && intent.length > 0) {
                let nombreAlimento

                if (alimento && alimento.length > 0) {
                    nombreAlimento = alimento[0].value
                }

                if (nombreAlimento) {
                    return {
                        text: `Aún no conozco cuántas calorías tiene "${nombreAlimento}", pero muy pronto lo sabré! 💪`,
                        type: 1
                    }
                }
            }
        }
    }
])