export class Random {
    static item(items: any[]) {
        return items[Math.floor(Math.random() * items.length)]
    }
}