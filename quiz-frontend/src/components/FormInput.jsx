export default function FormInput({ label, error, ...rest }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input {...rest} />
      {error && <div className="error">{error}</div>}
    </div>
  );
}


// import http from "./http";

// /**
//  * /api/users/register (multipart/form-data)
//  * Backend očekuje: Username, Email, Password, (FullName?), (ProfilePicture?)
//  */
// export async function registerUser(formData) {
//   try {
//     const { data } = await http.post("/api/users/register", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return data; // { success, message }
//   } catch (err) {
//     const msg =
//       err?.response?.data?.message ||
//       err?.response?.data?.title ||
//       err?.message ||
//       "Registracija nije uspela.";
//     throw new Error(msg);
//   }
// }
