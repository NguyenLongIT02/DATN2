import mock from "../MockConfig.tsx";
import userList from "../../fakedb/userList";

mock.onGet("/api/user/list").reply(200, userList);
