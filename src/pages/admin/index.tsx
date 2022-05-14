import React from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Button, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
const schema = Yup.object().shape({
  name: Yup.string().required(),
  password: Yup.string().required(),
});

const Admin = () => {
  const { t } = useTranslation();
  return (
    <div className="h-screen flex items-start pt-20 justify-center">
      <Formik
        initialValues={{
          name: "",
          password: "",
        }}
        validationSchema={schema}
        onSubmit={async (values, { setFieldError }) => {
          //
        }}
      >
        {({ handleBlur, handleChange, errors, values, touched }) => {
          return (
            <Form className="bg-white p-6 rounded-lg shadow w-96" id="new-user">
              <p className="text-xl font-medium text-center mb-4">t('createAccount')</p>
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
                type="password"
                name="password"
                placeholder={t("password")}
                value={values.password}
                autoComplete="new-password"
                id="new-password"
                onChange={handleChange}
                onBlur={handleBlur}
                label={(touched.password && errors.password) ?? ""}
                error={touched.password && !!errors.password}
              />
              <Button
                // disabled={loginMutation.isLoading}
                type="submit"
                sx={{ mt: 2 }}
                fullWidth
                color="primary"
                variant="contained"
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
