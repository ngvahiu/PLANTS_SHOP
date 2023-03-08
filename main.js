// let opacity of backgroundImage of header be decreased
let bgHeader = document.querySelector('.background__header');

window.onscroll = function () {
    let B = document.body; //IE 'quirks'
    let D = document.documentElement; //IE with doctype
    D = (D.clientHeight) ? D : B;
    
    if (D.scrollTop > 150) {
        bgHeader.style.opacity = '0.7';
    }
    else if (D.scrollTop == 0) {
        bgHeader.style.opacity = '1';
    }
};