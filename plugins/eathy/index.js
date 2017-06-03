//@flow

const folerpa = require('../../utils/folerpa')

const introducciones = [
    'Las calorías son:'
]

module.exports.default = folerpa.createMiddleware(({ conversation }) => {
    const {intent, alimento} = conversation.messages[0].messageValidation.data.entities

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
})