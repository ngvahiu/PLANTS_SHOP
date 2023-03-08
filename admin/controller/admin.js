import {
  apiGetProducts,
  apiUpdateProduct,
  apiGetProductById,
  apiDeleteProduct,
  apiCreateProduct,
} from "../services/productAPI.js";
import Product from "../../Product.js";
import Swal from "sweetalert2";

var productList = [];
getProducts();

// make global functions based on functions imported from ProductAPI
window.createProduct = createProduct;
window.deleteProduct = deleteProduct;
window.selectProduct = selectProduct;
window.updateProduct = updateProduct;
window.resetModal = resetModal;
window.sortAndSearch = sortAndSearch;

// REQUEST API
function getProducts(searchValue) {
  apiGetProducts(searchValue)
    .then((response) => {
      // Call API
      const products = response.data.map((product) => {
        return new Product(
          product.id,
          product.name,
          product.img,
          product.price,
          product.description
        );
      });
      productList = products;
      renderProducts(productList);
    })
    .catch((error) => {
      alert("API get products error");
    });
}

// ADDING PRODUCT
function createProduct() {
  let name = getElement("#ProductName").value.trim();
  let img = getElement("#ProductImage").value.trim();
  let price = getElement("#ProductPrice").value.trim();
  let description = getElement("#ProductDescription").value.trim();
  let type = getElement("#ProductType").value;

  if (!isValidated(name, img, price, description, type)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please fill information again",
    });
    return;
  }

  //create a new product
  type = "1" ? "Indoor Plants" : "Outdoor Plants";
  price = (+price).toString();
  const product = {
    name,
    img,
    price,
    description,
    type,
  };

  apiCreateProduct(product)
    .then((data) => {
      getProducts();
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Add new product successfully !",
        showConfirmButton: false,
        timer: 1500,
      });
    })
    .then(() => {
      getElement("#ProductName").value = "";
      getElement("#ProductImage").value = "";
      getElement("#ProductPrice").value = "";
      getElement("#ProductDescription").value = "";
      getElement("#ProductType").value = "";
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Fail to add a new product !",
      });
    });
}

// DELETE PRODUCT
function deleteProduct(productId) {
  //sweet alert animation
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success ms-1",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        //if confirmed to delete, call API
        apiDeleteProduct(productId)
          .then(() => {
            swalWithBootstrapButtons.fire(
              "Deleted!",
              "The product has been deleted.",
              "success"
            );
            getProducts();
          })
          .catch(() => {
            swalWithBootstrapButtons.fire(
              "Fail to delete",
              "Please try again",
              "error"
            );
          });
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          "Cancelled",
          "The product is safe :)",
          "error"
        );
      }
    });
}

// Hàm lấy chi tiết 1 sản phẩm và hiển thị lên modal
function selectProduct(productId) {
  // Mở và cập nhật giao diện cho modal
  getElement(".modal-title").innerHTML = "Update Product";
  getElement(".modal-footer").innerHTML = `
    <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
    <button class="btn btn-primary" onclick="window.updateProduct('${productId}')">Update</button>
  `;

  apiGetProductById(productId)
    .then((response) => {
      const product = response.data;
      getElement("#ProductName").value = product.name;
      getElement("#ProductImage").value = product.img;
      getElement("#ProductPrice").value = product.price;
      getElement("#ProductDescription").value = product.description;
      getElement("#ProductType").value =
        product.type === "Indoor Plants" ? 1 : 2;
    })
    .catch((error) => {
      alert("Fail to get information about product");
    });
}

// UPDATE PRODUCT
function updateProduct(productId) {
  let name = getElement("#ProductName").value.trim();
  let img = getElement("#ProductImage").value.trim();
  let price = getElement("#ProductPrice").value.trim();
  let description = getElement("#ProductDescription").value.trim();
  let type = getElement("#ProductType").value;

  if (!isValidated(name, img, price, description, type)) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please fill information again",
    });
    return;
  }

  //change information of product
  type = "1" ? "Indoor Plants" : "Outdoor Plants";
  price = (+price).toString();
  const product = {
    name,
    img,
    price,
    description,
    type,
  };

  apiUpdateProduct(productId, product)
    .then((response) => {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Update product successfully !",
        showConfirmButton: false,
        timer: 1500,
      });
      getProducts();
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Fail to update product !",
      });
    });
}

// RENDER PRODUCT ON TABLE
function renderProducts(products) {
  let html = products.reduce((result, product, index) => {
    return (
      result +
      `
      <tr>
        <th scope="row" class='fw-bold'>${index + 1}</th>
        <td>${product.name}</td>
        <td>$${product.price}</td>
        <td>
          <img src="${product.img}" with="70" height="70" />
        </td>
        <td>${product.description}</td>
        <td>
          <button class="btn btn-primary" 
          data-bs-toggle="modal"
          data-bs-target="#myModal"
          onclick="window.selectProduct('${product.id}')">
          Edit
          </button>
        </td>
        <td>
          <button class="btn btn-danger"
          onclick="window.deleteProduct('${product.id}')">
          Delete
          </button>
          </td>
      </tr>
    `
    );
  }, "");

  document.getElementById("ProductList").innerHTML = html;
}

//search name of plant
//sort plant based on price
getElement('#searchNameBtn').onclick = sortAndSearch;
getElement('#sortType').onchange = sortAndSearch;

function sortPriceAscending() {
  let name = getElement('#searchName').value.trim().toLowerCase();

  let tempList = productList.filter((product) => {
    return product.name.toLowerCase().includes(name);
  })

  tempList.sort(function (a, b) {
    return a.price - b.price;
  })

  renderProducts(tempList);
}

function sortPriceDescending() {
  let name = getElement('#searchName').value.trim().toLowerCase();

  let tempList = productList.filter((product) => {
    return product.name.toLowerCase().includes(name);
  })

  tempList.sort(function (a, b) {
    return b.price - a.price;
  })

  renderProducts(tempList);
}

function sortAndSearch() {
  let type = getElement('#sortType').value;
  switch (type) {
    case "1": {
      sortPriceAscending();
    }
      break;
    case '2': {
      sortPriceDescending();
    }
      break;
    default: {
      let name = getElement('#searchName').value.trim().toLowerCase();

      let tempList = [...productList];
      tempList = productList.filter((product) => {
        return product.name.toLowerCase().includes(name);
      })
      renderProducts(tempList);
    }
  }
}

// DOM
getElement("#AddProduct").addEventListener("click", () => {
  // reset modal
  getElement("#ProductName").value = "";
  getElement("#ProductImage").value = "";
  getElement("#ProductPrice").value = "";
  getElement("#ProductDescription").value = "";
  getElement("#ProductType").value = "";

  getElement(".modal-title").innerHTML = "Adding Product";
  getElement(".modal-footer").innerHTML = `
    <button id="addNewProduct" onclick="window.createProduct()" type="submit" class="btn-green">Add</button>
    <button type="button" class="btn-red" data-bs-dismiss="modal" onclick='window.resetModal()'>Close</button>
  `;
});

// Helpers
function getElement(selector) {
  return document.querySelector(selector);
}

//reset Modal
function resetModal() {
  getElement('#nameError').classList.add('d-none');
  getElement("#ProductName").classList.remove('border-danger');
  getElement('#imageError').classList.add('d-none');
  getElement("#ProductImage").classList.remove('border-danger');
  getElement('#priceError').classList.add('d-none');
  getElement("#ProductPrice").classList.remove('border-danger');
  getElement('#descriptionError').classList.add('d-none');
  getElement("#ProductDescription").classList.remove('border-danger');
  getElement('#typeError').classList.add('d-none');
  getElement("#ProductType").classList.remove('border-danger');
}

//===========================================
// Validate

function isValidated(name, img, price, description, type) {
  let isValidated = true;
  //check name
  if (!name) {
    getElement('#nameError').classList.remove('d-none');
    getElement("#ProductName").classList.add('border-danger');
    isValidated = false;
  } else {
    getElement('#nameError').classList.add('d-none');
    getElement("#ProductName").classList.remove('border-danger');
  }
  //check img
  if (!/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|webp)/.test(img)) {
    getElement('#imageError').classList.remove('d-none');
    getElement("#ProductImage").classList.add('border-danger');
    isValidated = false;
  } else {
    getElement('#imageError').classList.add('d-none');
    getElement("#ProductImage").classList.remove('border-danger');
  }
  //check price
  if (!/^\d+$/.test(price)) {
    getElement('#priceError').classList.remove('d-none');
    getElement("#ProductPrice").classList.add('border-danger');
    isValidated = false;
  } else {
    getElement('#priceError').classList.add('d-none');
    getElement("#ProductPrice").classList.remove('border-danger');
  }
  //check description
  if (!description) {
    getElement('#descriptionError').classList.remove('d-none');
    getElement("#ProductDescription").classList.add('border-danger');
    isValidated = false;
  } else {
    getElement('#descriptionError').classList.add('d-none');
    getElement("#ProductDescription").classList.remove('border-danger');
  }
  //check type
  if (!type) {
    getElement('#typeError').classList.remove('d-none');
    getElement("#ProductType").classList.add('border-danger');
    isValidated = false;
  } else {
    getElement('#typeError').classList.add('d-none');
    getElement("#ProductType").classList.remove('border-danger');
  }

  return isValidated;
}

