import CartItem from '../Model/CartItem.js';
import Cart from '../Model/Cart.js';
import Product from '../../Product.js';
import {apiGetProducts} from '../services/ProductAPI.js';
import Swal from 'sweetalert2';

// set global functions
window.addProductToCart = addProductToCart;
window.decreaseQuantity = decreaseQuantity;
window.increaseQuantity = increaseQuantity;
window.removeProduct = removeProduct;
window.getProducts = getProducts;

getProducts();
const cart = getProductsInCart();

// set up cart
renderCartModal();

// get API to render
function getProducts(searchValue) {
    apiGetProducts(searchValue)
        .then((response) => {
            const val = getElement('.listType').value;
            let type;
            switch (val) {
                case '1': {
                    type = 'Indoor Plants';
                }
                    break;
                case '2': {
                    type = 'Outdoor Plants';
                }
                    break;
                default:
                    type = ''
            }

            const products = response.data.filter((product) => (type && product.type === type) || !type).map((product) => {
                return new Product(
                    product.id,
                    product.name,
                    product.img,
                    product.price,
                    product.description,
                    product.type
                )
            }
            );

            renderProducts(products);
        })
        .catch((error) => {
            alert(error.message);
        })
}

function renderProducts(products) {
    const html = products.reduce((result, product, index) => {
        return result + `
            <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12 col-xs-12 mb-4 px-4">
                <div class="product__item text-center">
                    <div class="card pt-3">
                        <div class="d-flex justify-content-center">
                            <img class="card-img-top" src=${product.img} alt=${product.img}>
                        </div>
                        <div class="card-body">
                            <h4 class="card-title fw-bold">${product.name}</h4>
                            <p class="card-text">USD $${product.price}</p>
                        </div>
                    </div>
                    <div class="product__info">
                        <h1 class="fw-bold">Specifications</h1>
                        <ul class="text-start">
                            <li>Name: ${product.name}</li>
                            <li>Type: ${product.type}</li>
                            <li>Description: ${product.description.length > 30 ? product.description.substr(0, 29) + '...' : product.description}</li>
                            <li>Price: $${product.price}</li>
                        </ul>
                        <a href="#">Click here for more details</a>
                        <br>
                        <div class="text-center">
                            <button onclick="window.addProductToCart('${product.id}','${product.name}','${product.price}','${product.img}')" class="btn-yellow w-50">Add to cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    }, '')

    getElement('#products').innerHTML = html;
}

function renderCartModal() {
    // show selected products
    let html = cart.arrayItems.reduce((result, item, index) => {
        return result + `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>
                    <img style='width:50px; height: 50px;' src='${item.img}' alt='${item.img}'/>
                </td>
                <td>
                    <button type='button' class='btn decrease' onclick="window.decreaseQuantity('${item.id}')">-</button>
                    ${item.quantity}
                    <button type='button' class='btn increase' onclick="window.increaseQuantity('${item.id}')">+</button>
                </td>
                <td>$${item.price}</td>
                <td>$${(item.quantity * item.price).toLocaleString()}</td>
                <td>
                    <button class='btn btn-danger remove' onclick="window.removeProduct('${item.id}')">Remove</button>
                </td>
            </tr>
        `
    }, '')
    getElement('#itemList').innerHTML = html;

    // calculate payment
    const subTotal = cart.getTotalPayment();
    const tax = 10 * cart.getTotalQuantity();
    getElement('#totalPayment').innerHTML = `
        <tr>
            <th class='text-end' colspan='5'>Subtotal: </th>
            <td>$${subTotal.toLocaleString()}</td>
        </tr>
        <tr>
            <th class='text-end' colspan='5'>Tax: </th>
            <td scope='col'>$${tax}</td>
        </tr>
        <tr>
            <th class='text-end' colspan='5'>
                <i class="fa fa-arrow-right"></i> Total: 
            </th>
            <td scope='col'>$${subTotal + tax}</td>
        </tr>
    `

    // setup and update the total quantity of products in UI cart
    getElement('.totalQuantity').innerHTML = cart.getTotalQuantity().toString();

    // prevent click event from closing cart Modal
    document.querySelectorAll('.decrease').forEach(element => {
        element.addEventListener('click', e => {
            e.stopPropagation();
        })
    });

    document.querySelectorAll('.increase').forEach(element => {
        element.addEventListener('click', e => {
            e.stopPropagation();
        })
    });

    document.querySelectorAll('.remove').forEach(element => {
        element.addEventListener('click', e => {
            e.stopPropagation();
        })
    });
    
}

// update the total quantity of products in UI cart
function addProductToCart(productId, productName, productPrice, productImg) {
    cart.addItem(productId, productName, productPrice, productImg);

    storeProductsInCart();

    // update cart
    renderCartModal();
}

// decrease the quantity of a product by 1
function decreaseQuantity(itemId) {
    let index = cart.findIndex(itemId);

    if (index === -1) return;

    // in case the quantity of product is 1 -> remove this product from the cart
    if (cart.arrayItems[index].quantity === 1) {
        cart.arrayItems.splice(index, 1);
    } else {
        cart.arrayItems[index].quantity -= 1;
    }

    storeProductsInCart();
    renderCartModal();

}

// increase the quantity of a product by 1
function increaseQuantity(itemId) {
    let index = cart.findIndex(itemId);

    if (index === -1) return;

    cart.arrayItems[index].quantity += 1;

    storeProductsInCart();
    renderCartModal();
}

// remove product from cart
function removeProduct(itemId) {
    let index = cart.findIndex(itemId);

    if (index === -1) return;

    cart.arrayItems.splice(index, 1);

    storeProductsInCart();
    renderCartModal();
}

function getElement(selector) {
    return document.querySelector(selector);
}

// =======================================
// DOM
getElement('#emptyCart').onclick = () => {
    cart.arrayItems = [];
    storeProductsInCart();
    renderCartModal();
}

getElement('#pay').onclick = () => {
    console.log(1)
    if (!cart.arrayItems.length) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Your cart is empty!'
        })
    }
    else {
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Your order is done !',
            showConfirmButton: false,
            timer: 1500
        })
        cart.arrayItems = [];
        storeProductsInCart();
        renderCartModal();
    }
}

// =======================================
// get data from Local Storage
function getProductsInCart() {
    const json = localStorage.getItem('cart');
    if (!json) return new Cart([]);

    let cart = JSON.parse(json);

    cart = new Cart(cart.arrayItems);

    return cart;
}

// save data to Local Storage
function storeProductsInCart() {
    const json = JSON.stringify(cart);

    localStorage.setItem('cart', json);
}