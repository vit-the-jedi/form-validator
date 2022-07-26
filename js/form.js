//form.js controls the logic that lets user step through form
//this file should contain any logic that governs the behavior of the form (steps to show, when to show them, when not to move forward, etc)
//disable submit btn on load
const form = document.querySelector("form");
const formBtn = form.querySelector("button");

//utility to find an element's (el) specific parent by class name (clas)
function findParent(el, clas) {
  while ((el = el.parentNode) && el.className.indexOf(clas) < 0);
  return el;
}

//utility to check whether element is a checkbox - used in validateForm() and showErrors()
//uses ternary operator -> checks if condition before the ?(if) == true set ? to true :(else) set to false
const isCheckbox = (input) =>
  (input.getAttribute("type") === "checkbox") == true ? true : false;

//must do : accept form in as argument
//must return boolean value if form isValid of !isValid
//must pass invalid inputs to the showErrors func/method

const formValidateObj = {
  formElements: [...form.elements],
  invalidInputs: [],
  //utility method that accepts an array of elements in the 1st argument
  //accepts an array of strings, matching type attribute or id, as the second
  filterFormElements(elemsArray, [...filters]) {
    for (let i = 0; i < elemsArray.length; i++) {
      const elemAttribute = elemsArray[i].getAttribute("type");
      const elemId = elemsArray[i].id;
      //filter out elements we dont want
      for (const filter of filters) {
        if (elemAttribute === filter || elemId === filter) {
          elemsArray.splice(i, 1);
          //decrease i by one if we have removed an element from the array
          //this way we can keep up with the changing array length
          i -= 1;
        }
      }
    }
    return [...elemsArray];
  },
  //this function return true or false
  //we use it to perform our ajax request if true
  validateForm() {
    //get an array of form elements that pass our filter function
    //passing element types we want to omit
    let filteredArray = this.filterFormElements(this.formElements, [
      "submit",
      "hidden",
    ]);
    //check if passwordValidateObj exists and is defined as an object with our values + methods we need
    //if no, continue on with form validation under expectation there is no pw.js or passwordValidateObj
    //if yes, use our pw.js methods to verify password validity
    if (typeof passwordValidateObj === "object") {
      const passwordRulesValid = passwordValidateObj.validate();
      //if our pw.js method returns true, password are valid and don't need this function to validate them
      if (passwordRulesValid) {
        //filetering again, this time passing the password input id's we want to omit from array
        filteredArray = this.filterFormElements(filteredArray, [
          "user-password",
          "user-confirm-password",
        ]);
      }
    }
    //loop through our filteredArray and look for invalid criteria
    let errorArray = [];
    for (const elementToValidate of filteredArray) {
      if (elementToValidate.id === "email") {
        const emailValue = elementToValidate.value.toLowerCase();
        if (
          !emailValue.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ) ||
          emailValue === ""
        ) {
          errorArray.push(elementToValidate);
        }
      } else {
        if (elementToValidate.value === "" || elementToValidate.length === 0) {
          errorArray.push(elementToValidate);
        }
      }
    }
    if (errorArray.length !== 0) {
      showErrors(errorArray);
      return false;
    } else {
      return true;
    }
  },
};

//takes in and array of elements as an argument
function showErrors(arr) {
  const errorMsgs = document.getElementsByClassName("error-msg");
  const errorText = document.createElement("span");
  errorText.textContent = `Please review these errors (marked in red) and try again.`;
  errorText.id = "error-text";
  errorText.classList.add("error-msg");

  //loop through error array + add error class
  for (const el of arr) {
    el.classList.add("error");
    //if input is checkbox, then add error class to the label
    //its difficult to reliably style checkboxes across browsers, so instead just make the label text look like error
    if (isCheckbox(el)) {
      const checkBoxParent = el.parentElement;
      checkBoxParent.nextElementSibling.classList.add("error");
    }
  }
  //check to see if error messages exist + remove if yes
  if (errorMsgs.length !== 0) {
    errorMsgs[0].remove();
  }
  //place error message in form step where first error input occurs + scroll to it
  const errorParent = findParent(arr[0], "input-form");
  errorParent.prepend(errorText);
  arr[0].scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
}

function removeErrorClass(arr) {
  //loop through our array and remove error class from element and its closest parent element (if it has error class)
  let elemsToClassChange = [...arr];
  for (const el of elemsToClassChange) {
    if (el.nodeName.toLowerCase() === "label") {
      elemsToClassChange.push(el.nextElementSibling);
    } else {
    }
  }
  for (const element of elemsToClassChange) {
    const parent = element.closest(".error");
    if (element.classList.contains("error") || parent) {
      element.classList.remove("error");
      parent.classList.remove("error");
    }
    if (document.querySelector(".error-msg")) {
      form.removeChild(document.querySelector(".error-msg"));
    }
  }
}

//remove error classes (if they exist) on input interaction
$("input[type='text'],input[type='number'],input[type='email']").keyup(
  function (e) {
    const keyPressed = e.code || e.keyCode;
    //prevent script from removing error if users presses enter to submit the form while focused on an input
    switch (keyPressed) {
      case "ShiftLeft":
      case "ShiftRight":
      case "ControlLeft":
      case "ControlRight":
      case "MetaLeft":
      case "MetaRight":
      case "AltLeft":
      case "AltRight":
      case "Enter":
      case "Tab":
        break;
      default:
        removeErrorClass($(this));
    }
  }
);
$("input[type='password").keyup(function () {
  const passwordInputs = form.querySelectorAll("input[type='password']");
  removeErrorClass(passwordInputs);
});
$("input[type='checkbox']").click(function () {
  removeErrorClass($(this));
});
$("select").change(function () {
  removeErrorClass($(this));
});
