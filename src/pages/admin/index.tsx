import React from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Button, TextField, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { addUser } from "@/api/auth";
import { FaEye, FaEyeSlash } from "@/components/icons";
import { useMutation } from "react-query";
import { showToast } from "@/components/toast";

const schema = Yup.object().shape({
  name: Yup.string().max(99).required(),
  password: Yup.string().max(99).required(),
});

const Admin = () => {
  const { t } = useTranslation("auth");
  const adduUserMutaton = useMutation(addUser);
  return (
    <div className="h-screen flex items-start pt-20 justify-center">
      <Formik
        initialValues={{
          name: "",
          password: "",
          showPassword: true,
        }}
        validationSchema={schema}
        onSubmit={async ({ name, password }, { resetForm, setFieldError }) => {
          const { isValid, message } = await adduUserMutaton.mutateAsync({
            name,
            password,
          });
          if (isValid) {
            showToast({
              children: t("userAdded"),
              autoHideDuration: 1500,
            });
            resetForm();
          } else {
            setFieldError("name", message);
          }
        }}
      >
        {({ handleBlur, handleChange, errors, values, touched, setFieldValue }) => {
          return (
            <Form className="bg-white p-6 rounded-lg shadow w-96" id="new-user">
              <p className="text-xl font-medium text-center mb-4">{t("createAccount")}</p>
              <TextField
                fullWidth
                placeholder={t("account")}
                name="name"
                value={values.name}
                onChange={handleChange}
                autoComplete="off"
                onBlur={handleBlur}
                label={(touched.name && errors.name) ?? ""}
                error={touched.name && !!errors.name}
              />

              <TextField
                sx={{ mt: 2 }}
                fullWidth
                type={values.showPassword ? "password" : "text"}
                name="password"
                placeholder={t("password")}
                value={values.password}
                autoComplete="new-password"
                id="new-password"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => {
                        setFieldValue("showPassword", !values.showPassword);
                      }}
                    >
                      {values.showPassword ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                    </IconButton>
                  ),
                }}
                onChange={handleChange}
                onBlur={handleBlur}
                label={(touched.password && errors.password) ?? ""}
                error={touched.password && !!errors.password}
              />
              <Button
                type="submit"
                sx={{ mt: 2 }}
                fullWidth
                color="primary"
                variant="contained"
                disabled={adduUserMutaton.isLoading}
              >
                {t("confirmCreate")}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default Admin;
