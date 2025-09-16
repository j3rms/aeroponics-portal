// import "server-only";
import { url, publicUrl } from "./routes";
import { cookies } from "next/headers";
import { getToken } from "./auth_lib/session";

const apiClient = async (url, options) => {
  options.cache = "no-cache";

  try {
    let token = await getToken();
    options.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    let res = await fetch(url, options);

    let resObj = await res.json();
    resObj.code = res.status;

    return resObj;
  } catch (error) {
    // console.log("error message", error)
    return {
      code: 500,
      status: false,
      message: "error in API",
      data: [],
    };
  }
};

const getAllModules = async (modules, mode, params) => {
  let endpoint = "";

  if (mode == "user") {
    endpoint = `${url()}/${modules}/post${params}`;
  } else {
    endpoint = `${url()}/${modules}${params}`;
  }

  // console.log("@get all modules", endpoint);

  let data = await apiClient(endpoint, {});

  console.log("data modules", JSON.stringify(data));

  if (!data.status) {
    data.data = [];
  }

  if (data.data == undefined || data.data == null) {
    data.data = [];
  }

  // console.log("@get all modules data", JSON.stringify(data));
  // console.log("@get all modules status and message", data.status, data.message);

  return {
    status: data.status,
    message: data.message,
    data: data.data,
    totalCount: data.count || data.data.length,
  };
};

const getModuleByID = async (modules, id) => {
  let endpoint = `${url()}/${modules}/${id}`;

  let data = await apiClient(endpoint, {});
  // let data = filterData(id)

  console.log("data modules", JSON.stringify(data));

  if (!data.status || data.status == 500) {
    data.status = false;
    data.data = [];
  }

  if (data.data == undefined || data.data == null) {
    data.data = [];
  }

  return {
    status: data.status,
    message: data.message,
    data: data.data,
  };
};

const getStatusCount = async () => {
  let endpoint = `${url()}/user/count/status`;

  let data = await apiClient(endpoint, {});
  // let data = filterData(id)

  // console.log("data modules", JSON.stringify(data))

  if (!data.status || data.status == 500) {
    data.status = false;
    data.data = [];
  }

  if (data.data == undefined || data.data == null) {
    data.data = [];
  }

  return {
    status: data.status,
    message: data.message,
    data: data.data,
  };
};

const returnUserRole = async () => {
  const user = cookies().get("user").value;

  // console.log("user", user)
  const parsedUser = JSON.parse(decodeURIComponent(user));

  return parsedUser.role;
};

const returnUserLevel = async () => {
  const user = cookies().get("user").value;

  const parsedUser = JSON.parse(decodeURIComponent(user));
  // console.log("user level = ", JSON.stringify(parsedUser));
  return parsedUser.userGroup;
};

export {
  apiClient as api,
  getAllModules,
  getModuleByID,
  returnUserRole,
  getStatusCount,
  returnUserLevel,
};
