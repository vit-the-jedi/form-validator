"use strict";

const uiTimingParam = 3000;
const modalOverlay = document.createElement("div");
const accountSubmitForm = document.getElementById("create-account");

//utility functions
//
//
//use this to quickly create elements and pass attributes to them
const createNode = function (object, attributes) {
  const el = document.createElement(object);
  for (let key in attributes) {
    el.setAttribute(key, attributes[key]);
  }
  return el;
};
//
//
//use this to enable a button that you pass
//const allowSubmit = (btn) => btn.removeAttribute("disabled");
//
//
//use this to disable a button that you pass
//const disableSubmit = (btn) => btn.setAttribute("disabled", "disabled");
//
//
//use to hide loader (on ajax response)
const hideLoadingAnimation = () => {
  const loader = document.querySelector(`#loader`);
  loader.classList.add("loading-done");
};
//
//
//use to show loader (on form submit)
const showLoadingAnimation = () => {
  const loader = document.querySelector(`#loader`);
  loader.classList.remove("loading-done");
  loader.classList.add("loading");
};
//
//
//use this to hide a modal that you pass in as an arg (html element)
const hideModal = (modalToHide) => {
  //const modalHide = document.querySelector(`#${modalToHide.id}`);
  modalToHide.classList.remove("modal-show");
};
//
//
//use this to show a modal that you pass in as an arg
//default is set to the emailVerificationModal
const showModal = (modalToShow = document.querySelector("#verify-email")) => {
  //display saved email address for UX - if we have one
  const email = localStorage.getItem("email") || undefined;
  if (email) {
    const emailTextEls = modalToShow.querySelectorAll(".user-email");
    for (const el of emailTextEls) {
      el.textContent = email;
    }
  }
  modalOverlay.classList.add("modal-backdrop");
  //const modalShow = document.querySelector(`#${modalToShow.id}`);
  modalToShow.classList.add("modal-show");
};
//hanlder function to logically show either the emailVerificationModal, or the resendCodeModal
//depending on user click
const emailModalHandler = (ev) => {
  const resendCodeModal = document.querySelector("#resend-code");
  const emailCodeModal = document.querySelector("#verify-email");
  ev.preventDefault();
  if (ev.target.id === "resend-code-link") {
    showModal(resendCodeModal);
    hideModal(emailCodeModal);
    //fade resendCodeModal out and fade emailVerificationModal back in
    setTimeout(function () {
      hideModal(resendCodeModal);
      showModal(emailCodeModal);
    }, uiTimingParam);
  } else if (ev.target.id === "new-email-link") {
    //hide emailVerificationModal and focus the email input so user can quickly change
    //must re-submit form to proceed
    hideModal(emailCodeModal);
    modalOverlay.classList.remove("modal-backdrop");
    emailInput.focus();
  }
};

const emailVerificationModal = {
  id: "verify-email",
  class: "user-info-modal",
  header: "<h3>Verify your email!</h3>",
  body: [
    `<h6>We've sent an email to <span class="user-email body-font-bold"></span> that contains a verification code. Please enter the code below to verify your email and get started!</h6><form id="verify-email-form" class="input-form" method="POST" action=""><input id="verifyEmail" type="text" placeholder="Enter 8 digits"><button id="submitCode">Verify Email</button></form><p>Check that the email above is correct. If it isn't, register <a href="registerNewEmail" id="new-email-link">with a different email</a>. If it is correct, check your spam and promo folders to make sure it isn't there. Otherwise, click below to resend verification&nbsp;email.<br/>
<a href="resendCode" id="resend-code-link">Resend email</a></p>`,
  ],
  //event listeners for the emailVerificationModal options (resend code, change email, or submit)
  addListeners() {
    const newEmail = document.querySelector("#new-email-link");
    const resendCode = document.querySelector("#resend-code-link");
    const codeInput = document.querySelector("#verifyEmail");
    const codeSubmitBtn = document.querySelector("#submitCode");
    resendCode.addEventListener("click", function (e) {
      emailModalHandler(e);
    });
    newEmail.addEventListener("click", function (e) {
      emailModalHandler(e);
    });
    codeSubmitBtn.addEventListener("click", function (e) {
      e.preventDefault();
      codeValidation(codeInput);
    });
  },

  createModal() {
    //create modal
    const computedModal = this;
    const modal = createNode("div", {
      class: `modal ${computedModal["class"]}`,
      id: computedModal["id"],
    });
    const modalInner = createNode("div", {
      class: `modal-inner`,
    });
    if (this.header) {
      modalInner.innerHTML += this.header;
    }
    if (this.body) {
      modalInner.innerHTML += this.body;
    }
    modal.appendChild(modalInner);
    document.body.appendChild(modal);
    if (computedModal.addListeners) {
      computedModal.addListeners();
    }
    document.body.appendChild(modalOverlay);
  },
};

const resendCodeModal = {
  id: "resend-code",
  class: "user-info-modal",
  header: '<h3>New Code Sent To <span class="user-email"></span></h3>',
  body: `<i class="fa-solid fa-envelope-circle-check"></i>`,
};

//add our createModal method to a variable
const createModal = emailVerificationModal.createModal;
//call our method
emailVerificationModal.createModal();
//enable the method on our other modal object + call it
//.call() allows us to bind the 'this' keyword to the object we pass in as an arg
createModal.call(resendCodeModal);

//match code input against regex pattern
//show errors if it doesn't
const codeValidation = (codeInput) => {
  let codeErrArray = [];
  const regex = "^[0-9]{8}$";
  if (!codeInput.value.match(regex)) {
    codeErrArray.push(codeInput);
    showErrors(codeErrArray);
  } else {
    submitOrd();
  }
};
