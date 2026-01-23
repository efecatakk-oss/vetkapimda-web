const firebaseConfig = {
  apiKey: "AIzaSyAl563jzr7ddmdaOEWXrm1Bx7hFEYXY-PI",
  authDomain: "vetkapim.firebaseapp.com",
  projectId: "vetkapim",
  storageBucket: "vetkapim.firebasestorage.app",
  messagingSenderId: "756311357966",
  appId: "1:756311357966:web:4d5442761899234de05a5f",
  measurementId: "G-QF8KPXNFDF",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const form = document.getElementById("signupForm");
const statusEl = document.getElementById("signupStatus");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("signupNameFull").value.trim();
  const surname = document.getElementById("signupSurnameFull").value.trim();
  const email = document.getElementById("signupEmailFull").value.trim();
  const password = document.getElementById("signupPasswordFull").value.trim();
  const passwordRepeat = document
    .getElementById("signupPasswordRepeat")
    .value.trim();
  const phone = document.getElementById("signupPhoneFull").value.trim();
  const birthdate = document.getElementById("signupBirthdateFull").value;
  const gender = document.querySelector('input[name="genderFull"]:checked')?.value || "";
  const acceptTerms = document.getElementById("signupAcceptTerms").checked;

  if (!name || !surname || !email || !password || !phone) {
    setStatus("Tum zorunlu alanlari doldurun.", true);
    return;
  }
  if (password !== passwordRepeat) {
    setStatus("Sifreler eslesmiyor.", true);
    return;
  }
  if (!acceptTerms) {
    setStatus("KVKK ve Hizmet Sartlari kabul edilmeli.", true);
    return;
  }

  setStatus("Uyelik olusturuluyor...", false);
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      const uid = cred.user.uid;
      return db.collection("users").doc(uid).set({
        email,
        name,
        surname,
        phone,
        gender,
        birthdate,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    })
    .then(() => {
      setStatus("Uyelik tamamlandi. Giris yapabilirsiniz.", false);
      form.reset();
    })
    .catch((error) => {
      setStatus(error.message || "Uyelik olusturulamadi.", true);
    });
});

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}
