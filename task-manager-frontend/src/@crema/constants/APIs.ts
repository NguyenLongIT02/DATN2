export const APP_URL = 'http://localhost:3001/api/v1/';
export const PAGE_URL = (page = 1, limit = 15) =>
  `?page=${page}&limit=${limit}`;
export const AUTH_ME_URL = 'auth/me';
export const LOGIN_URL = 'auth/center/email/login';

export const STUDENT_History_Contact_URL = (id: number) =>
  `students/student-calls-by-center/${id}`;
export const STUDENT_Contact_URL = (id: number) =>
  `students/student-Without-center/${id}`;

export const STUDENT_CALL_LIST = (gId: string) =>
  `calls/find-by-gid-receiver/${gId}`;
