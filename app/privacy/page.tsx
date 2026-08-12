import Link from "next/link";

export const metadata = {
  title: "Privacy & Data Use — SignLang",
  description:
    "What SignLang records, where it is processed, and what schools and guardians should know.",
};

export default function PrivacyPage() {
  return (
    <div className="page">
      <div className="shell-narrow">
        <Link
          href="/home"
          className="muted text-[13px] font-medium hover:text-[var(--text)]"
        >
          ← Back
        </Link>

        <p className="eyebrow mt-6">Transparency</p>
        <h1 className="page-title mt-2">Privacy &amp; data use</h1>
        <p className="lede mt-3">
          SignLang is used in classrooms and by learners who may be minors. This
          page sets out exactly what the application records, where it is
          processed, and what it never does.
        </p>

        <hr className="divider my-10" />

        <section>
          <h2 className="section-title">Your camera</h2>
          <p className="lede mt-3">
            The camera is required to estimate finger and hand positions, which
            is how the app checks whether a sign has been performed correctly.
            It is only active on the learning and evaluation screens, and only
            after the browser permission prompt has been accepted.
          </p>
          <div className="card-muted mt-5">
            <p className="text-[15px] font-medium">
              Video never leaves the device.
            </p>
            <p className="muted mt-2 text-[15px] leading-relaxed">
              Hand tracking (MediaPipe) and sign recognition (ONNX Runtime) both
              run inside the browser. No image, video frame or audio recording
              is uploaded, transmitted or stored on any server. Only the
              resulting outcome — such as a lesson being completed or a test
              score — is saved.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="section-title">What is stored in your account</h2>
          <p className="lede mt-3">
            The following is saved to Google Firebase (Firestore), tied to your
            account and readable only by you:
          </p>

          <ul className="mt-5 space-y-3">
            {[
              [
                "Account details",
                "Email address and password, handled by Firebase Authentication. Passwords are never visible to the application.",
              ],
              [
                "Profile information",
                "Any full name, home address, contact number and profile photo you choose to enter. All of these are optional.",
              ],
              [
                "Learning progress",
                "Which lessons you finished, test scores, and any custom lessons or tests you created.",
              ],
              [
                "Cognitive analysis reports",
                "Questionnaire answers and the scores generated from them, with the date of each report.",
              ],
              [
                "Preferences",
                "Your chosen colour theme.",
              ],
            ].map(([title, body]) => (
              <li key={title} className="card">
                <p className="text-[15px] font-medium">{title}</p>
                <p className="muted mt-1.5 text-[14.5px] leading-relaxed">
                  {body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="section-title">What the reports are for</h2>
          <p className="lede mt-3">
            Cognitive analysis reports are a teaching aid. They summarise
            observed behaviour and in-app performance to help staff tailor
            support. They are{" "}
            <span className="font-medium text-[var(--text)]">
              not a medical or psychological diagnosis
            </span>{" "}
            and should not be used as one.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="section-title">Access, retention and deletion</h2>
          <p className="lede mt-3">
            Only the signed-in account can read or change its own data; this is
            enforced by server-side security rules, not merely by the interface.
            You can edit or clear your profile details at any time from the
            Profile page. To have an account and everything under it deleted,
            contact the project team.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="section-title">For schools and guardians</h2>
          <p className="lede mt-3">
            If SignLang is deployed in an institution, the institution is
            responsible for obtaining informed consent from guardians before
            students use it, for explaining that a camera is required, and for
            deciding who may view a student&apos;s reports. A device with a
            working camera and a modern browser is required.
          </p>
          <div className="card-muted mt-5">
            <p className="muted text-[14px] leading-relaxed">
              This notice describes how the software currently behaves. It is
              not legal advice — before any paid or institutional deployment,
              have it reviewed against the data-protection obligations that
              apply in your jurisdiction, and add your contact details and a
              named data controller.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
