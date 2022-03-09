import { useEffect } from "react";

interface Props {
  signedIn: ({ credential }: { credential: string }) => void;
}

export default function GoogleSignInButton({ signedIn }: Props) {
  useEffect(() => {
    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    window.handleToken = signedIn;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <>
      <div
        id="g_id_onload"
        data-client_id="619781818658-saf14vdg9e70nn652ueisfdqe08n531a.apps.googleusercontent.com"
        data-auto_prompt="false"
        data-callback="handleToken"
      ></div>
      <div
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left"
      ></div>
    </>
  );
}
