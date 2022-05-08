import React from "react";
import { Button } from "@/components";
import LogoWithName from "@/assets/logo-name.png";
import { Tooltip } from "@/components";
const Home = () => {
  return (
    <div className="h-screen p-6 max-w-6xl mx-auto hidden" style={{}}>
      <h1 className="flex items-center justify-between">
        <img src={LogoWithName} className="h-6" alt="" />
        <Button variant="plain" size="small">
          login
        </Button>
      </h1>

      <main className="mt-20">
        <p className="text-5xl font-bold">make your workflow faster than ever before</p>
        <p className="mt-4 text-3xl">make your workflow faster than ever before</p>
        <div className="mt-10">
          <Button variant="default" intent="primary">
            Get a demo
          </Button>
        </div>
        <p className="text-3xl font-bold">support Python/Go</p>
        <p>
          This library requires a provider component which supplies i18n details to the rest of the app, and coordinates
          the loading of translations. Somewhere near the "top" of your application, render a I18nContext.Provider
          component. This component accepts an I18nManager as the
        </p>
        <p className="text-3xl font-bold">Trigger a task whatever you want</p>

        <p className="text-3xl font-bold">Log system is ready</p>
        <p className="text-3xl font-bold">Distributed and High availability</p>
      </main>
      {/* <div>
        <Button intent="primary">
          <Link className="flex h-full items-center w-full" to="/flow">
            flow
          </Link>
        </Button>
        <div>这里是描述， 这里是描述， 这里是描述， 这里是描述， 这里是描述， 这里是描述，</div>
      </div> */}
    </div>
  );
};

export default Home;
