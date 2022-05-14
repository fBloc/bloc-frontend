import React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useLocation, Link, useNavigate, Navigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { login } from "@/api/auth";
import Logo from "@/assets/logo.png";
import LogoWithName from "@/assets/logo-name.png";
import { identificationInstance } from "@/shared/Identification";
import { useMutation } from "react-query";

const schema = Yup.object().shape({
  name: Yup.string().required(),
  password: Yup.string().required(),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";
  const { t } = useTranslation();

  const loginMutation = useMutation(login);
  if (identificationInstance.isValidLogin) {
    return <Navigate to="/flow" replace />;
  }

  return (
    <div className="h-screen flex flex-col items-center bg-gray-50">
      <header className="p-6 flex items-center justify-between w-full">
        <img src={Logo} alt="logo" className="w-12" />
      </header>
      <Formik
        initialValues={{
          name: "",
          password: "",
        }}
        validationSchema={schema}
        onSubmit={async (values, { setFieldError }) => {
          const { isValid, message, data } = await loginMutation.mutateAsync(values);
          if (isValid && data) {
            identificationInstance.saveToken(data.token);
            navigate(from || "/flow", { replace: true });
          } else {
            setFieldError("password", message);
          }
        }}
      >
        {({ handleBlur, handleChange, errors, values, touched }) => {
          return (
            <Form className="bg-white p-6 rounded-lg shadow w-96">
              <div className="mb-10 text-3xl text-center">
                <img src={LogoWithName} alt="logo" className="h-10 mx-auto" />
                <p className="text-sm mt-2 text-gray-400 font-mono">
                  you agree to the storing of cookies on your device
                </p>
              </div>
              <TextField
                fullWidth
                placeholder={t("account")}
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                label={(touched.name && errors.name) ?? ""}
                error={touched.name && !!errors.name}
              />

              <TextField
                sx={{ mt: 2 }}
                fullWidth
                type="password"
                name="password"
                placeholder={t("password")}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                label={(touched.password && errors.password) ?? ""}
                error={touched.password && !!errors.password}
              />
              <Button
                disabled={loginMutation.isLoading}
                type="submit"
                sx={{ mt: 2 }}
                fullWidth
                color="primary"
                variant="contained"
              >
                {t("login")}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
export default Login;
