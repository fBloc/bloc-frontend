import request from "@/shared/request";

export const getStorageDetail = (key: string) => {
  return request.get(`api/v1/object_storage/get_string_value_by_key/${key}`);
};
