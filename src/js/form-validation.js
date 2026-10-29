document.addEventListener("DOMContentLoaded", () => {
   const form = document.getElementById("contact__form");

   function isValidEmail(email) {
      const emailRegex = /^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+$/;

      return emailRegex.test(email);
   }

   function isValidPhoneNumber(phone) {
      const phoneRegex = /^\d{10,12}$/;

      return phoneRegex.test(phone);
   }

   const rules = {
      name: (value) => (value.trim() ? "" : "Please enter your name"),
      email: (value) => {
         if (!value.trim()) return "Please enter your email";
         return isValidEmail(value) ? "" : "Enter a valid email address";
      },
      phone: (value) => {
         const digits = value.replace(/[\s()+-]/g, "");
         if (!digits) return "";
         return isValidPhoneNumber(digits) ? "" : "Phone must have 10-12 digits";
      },
      message: (value) => (value.trim() ? "" : "Please enter a message")
   };

   function showError(field, message) {
      const row = field.closest('.form__row');
      let tooltip = row.querySelector(".form__tooltip");

      if (!message) {
         row.classList.remove("form__row--invalid");
         if (tooltip) tooltip.remove();
         return;
      }

      if (!tooltip) {
         tooltip = document.createElement("span");
         tooltip.className = "form__tooltip";
         tooltip.setAttribute("role", "alert");
         row.append(tooltip);
      }
      tooltip.textContent = message;
      row.classList.add("form__row--invalid");
   }

   form.addEventListener("submit", (event) => {
      let firstInvalid = null;

      Object.keys(rules).forEach((name) => {
         const field = form.elements[name];
         const message = rules[name](field.value);
         showError(field, message);
         if (message && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
         event.preventDefault();
         firstInvalid.focus();
      }
   });

   form.addEventListener('input', (event) => {
      const field = event.target;
      const row = field.closest(".form__row");
      if (rules[field.name] && row.classList.contains("form__row--invalid")) {
         showError(field, rules[field.name](field.value));
      }
   })
})