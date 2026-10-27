/* ==========================================================
   WebDev-Registration | script.js
   ========================================================== */

/* ---------- 2. Grab references to the DOM ---------- */
const form        = document.getElementById("regform");
const successMsg  = document.getElementById("successMsg");
const memberList  = document.getElementById("memberList");
const emptyNote   = document.getElementById("emptyNote");
const countEl     = document.getElementById("count");
const themeBtn    = document.getElementById("theme");

// Every input/select/textarea, keyed by its id
const fields = {
  name:     document.getElementById("name"),
  email:    document.getElementById("email"),
  password: document.getElementById("password"),
  confirm:  document.getElementById("confirm-password"),
  gender:   document.getElementById("gender"),
  dob:      document.getElementById("dob"),
  country:  document.getElementById("country"),
  phone:    document.getElementById("phone"),
  bio:      document.getElementById("bio"),
};

// Each field's matching .error element
const errors = {
  name:     document.getElementById("nameError"),
  email:    document.getElementById("emailError"),
  password: document.getElementById("passwordError"),
  confirm:  document.getElementById("confirmError"),
  gender:   document.getElementById("genderError"),
  dob:      document.getElementById("dobError"),
  country:  document.getElementById("countryError"),
  phone:    document.getElementById("phoneError"),
  bio:      document.getElementById("bioError"),
};

// Confirm everything was found (anything null will show up here)
console.log("form:", form);
console.log("fields:", fields);
console.log("errors:", errors);
console.log("successMsg:", successMsg);
console.log("memberList:", memberList);
console.log("count:", countEl);
console.log("theme button:", themeBtn);

// Members are kept in an array so the list and counter stay in sync
let members = [];
let nextId = 1;
let successTimer = null;

/* ---------- Helpers ---------- */
function setError(key, message) {
  errors[key].textContent = message;
  fields[key].classList.add("invalid");
}

function clearError(key) {
  errors[key].textContent = "";
  fields[key].classList.remove("invalid");
}

function calculateAge(dobValue) {
  const birth = new Date(dobValue);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/* ---------- 4. Validation ---------- */
// Returns true if every field is valid; shows messages in the .error spans
function validateForm() {
  let valid = true;

  const name     = fields.name.value.trim();
  const email    = fields.email.value.trim();
  const password = fields.password.value;
  const confirm  = fields.confirm.value;
  const gender   = fields.gender.value;
  const dob      = fields.dob.value;
  const country  = fields.country.value.trim();
  const phone    = fields.phone.value.trim();
  const bio      = fields.bio.value.trim();

  // Name
  if (name === "") {
    setError("name", "Full name is required.");
    valid = false;
  } else if (name.length < 3) {
    setError("name", "Name must be at least 3 characters.");
    valid = false;
  } else if (!/^[A-Za-z][A-Za-z\s'.-]*$/.test(name)) {
    setError("name", "Name can only contain letters and spaces.");
    valid = false;
  }

  // Email
  if (email === "") {
    setError("email", "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("email", "Enter a valid email address.");
    valid = false;
  } else if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
    setError("email", "This email is already registered.");
    valid = false;
  }

  // Password
  if (password === "") {
    setError("password", "Password is required.");
    valid = false;
  } else if (password.length < 8) {
    setError("password", "Password must be at least 8 characters.");
    valid = false;
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    setError("password", "Use at least one letter and one number.");
    valid = false;
  }

  // Confirm password
  if (confirm === "") {
    setError("confirm", "Please confirm your password.");
    valid = false;
  } else if (confirm !== password) {
    setError("confirm", "Passwords do not match.");
    valid = false;
  }

  // Gender
  if (gender === "") {
    setError("gender", "Please select a gender.");
    valid = false;
  }

  // Date of birth
  if (dob === "") {
    setError("dob", "Date of birth is required.");
    valid = false;
  } else if (new Date(dob) > new Date()) {
    setError("dob", "Date of birth cannot be in the future.");
    valid = false;
  } else if (calculateAge(dob) < 16) {
    setError("dob", "You must be at least 16 years old.");
    valid = false;
  }

  // Country
  if (country === "") {
    setError("country", "Country is required.");
    valid = false;
  } else if (!/^[A-Za-z][A-Za-z\s'-]+$/.test(country)) {
    setError("country", "Enter a valid country name.");
    valid = false;
  }

  // Phone
  if (phone === "") {
    setError("phone", "Phone number is required.");
    valid = false;
  } else if (!/^\+?[0-9\s-]{9,15}$/.test(phone)) {
    setError("phone", "Enter a valid phone number, e.g. +254 700 000 000.");
    valid = false;
  }

  // Bio
  if (bio === "") {
    setError("bio", "Bio is required.");
    valid = false;
  } else if (bio.length < 10) {
    setError("bio", "Bio must be at least 10 characters.");
    valid = false;
  } else if (bio.length > 300) {
    setError("bio", "Bio must be 300 characters or fewer.");
    valid = false;
  }

  return valid;
}

/* ---------- 5. Clear errors as the user fixes them ---------- */
Object.keys(fields).forEach(key => {
  const eventName = fields[key].tagName === "SELECT" ? "change" : "input";
  fields[key].addEventListener(eventName, () => clearError(key));
  // Date inputs also fire "change" when a date is picked from the calendar
  if (fields[key].type === "date") {
    fields[key].addEventListener("change", () => clearError(key));
  }
});

/* ---------- 6. Register the member (DOM creation) ---------- */
function addMemberToList(member) {
  const li = document.createElement("li");
  li.className = "member-item";
  li.dataset.id = member.id;

  const info = document.createElement("div");
  info.className = "info";

  const nameEl = document.createElement("strong");
  nameEl.textContent = member.name;

  const detailEl = document.createElement("span");
  detailEl.textContent = `${member.email} · ${member.country}`;

  info.appendChild(nameEl);
  info.appendChild(detailEl);

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove";
  removeBtn.textContent = "Remove";
  removeBtn.setAttribute("aria-label", `Remove ${member.name}`);

  li.appendChild(info);
  li.appendChild(removeBtn);
  memberList.appendChild(li);
}

/* ---------- 7. Update the member counter (and empty note) ---------- */
function updateCounter() {
  countEl.textContent = members.length;
  emptyNote.classList.toggle("hidden", members.length > 0);
}

/* ---------- 8. Success message and reset ---------- */
function showSuccess(name) {
  successMsg.textContent = `Welcome aboard, ${name}! Registration successful.`;
  successMsg.classList.remove("hidden");

  clearTimeout(successTimer);
  successTimer = setTimeout(() => {
    successMsg.classList.add("hidden");
  }, 4000);
}

/* ---------- 3. Capture the form submission ---------- */
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  successMsg.classList.add("hidden");

  if (!validateForm()) {
    // Focus the first invalid field to help the user
    const firstInvalid = form.querySelector(".invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Build the member object (password is deliberately not stored/displayed)
  const member = {
    id: nextId++,
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    gender: fields.gender.value,
    dob: fields.dob.value,
    country: fields.country.value.trim(),
    phone: fields.phone.value.trim(),
    bio: fields.bio.value.trim(),
  };

  members.push(member);
  addMemberToList(member);
  updateCounter();
  showSuccess(member.name);

  form.reset();
  Object.keys(fields).forEach(clearError);
  fields.name.focus();
});

/* ---------- 9. Remove a member (event delegation) ---------- */
memberList.addEventListener("click", function (event) {
  const btn = event.target.closest(".remove");
  if (!btn) return;

  const li = btn.closest(".member-item");
  const id = Number(li.dataset.id);

  members = members.filter(m => m.id !== id);
  li.remove();
  updateCounter();
});

/* ---------- 10. Dark Mode toggle ---------- */
themeBtn.addEventListener("click", function () {
  const isDark = document.body.classList.toggle("dark");
  themeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
});

// Initial state
updateCounter();