import { WebPages, Random, Middleware } from '../../utils/folerpa'

export default Middleware.create([
    {
        entities: [
            'alimento'
        ],
        intent: 'get_calorías',
        async run(request, intent, { alimento }) {
            const [{ value: nombreAlimento }] = alimento

            if (nombreAlimento) {
                return {
                    text: `Aún no conozco cuántas calorías tiene "${nombreAlimento}", pero muy pronto lo sabré! 💪`,
                    type: 1
                }
            }
        }
    }
])