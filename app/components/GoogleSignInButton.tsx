import { useEffect } from "react";
import config from "~/config";

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
        data-client_id={config.CLIENT_ID}
        data-auto_prompt="false"
        data-callback="handleToken"
      ></div>
      <div
        className="g_id_signin h-8"
        data-type="standard"
        data-size="medium"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="pill"
        data-logo_alignment="left"
      ></div>
    </>
  );
}
