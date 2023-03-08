import CartItem from './CartItem.js'
export default class Cart {
    constructor(arrayItems) {
        this.arrayItems = arrayItems; // contains list of added items
    }

    findIndex(productId) {
        return this.arrayItems.findIndex(item => item.id === productId);
    }

    addItem(productId, productName, productPrice, productImg) {
        let index = this.findIndex(productId);

        if (index === -1) {
            const newItem = new CartItem(productId, productName, productPrice, productImg, 1);
            this.arrayItems.push(newItem);
        } else {
            let quantity = +this.arrayItems[index].quantity;

            quantity++;
            quantity.toString();

            this.arrayItems[index].quantity = quantity;
        }
    }

    emptyCart() {
        this.arrayItems.splice(0, this.arrayItems.length);
    }

    getTotalQuantity() {
        return this.arrayItems.reduce((result, item) => {
            return result += (+item.quantity);
        }, 0);
    }

    getTotalPayment() {
        return this.arrayItems.reduce((result, item) => {
            return result += ((+item.quantity) * (+item.price));
        }, 0);
    }
}