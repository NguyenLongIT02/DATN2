export type DrStateType = {
  id: number;
  category: string;
  name: string;
  bgColor?: string;
  time: string;
  icon: string;
};

export type HeathStaticsDataType = {
  dataOne: {
    month: string;
    number: number;
  }[];
  dataTwo: {
    month: string;
    number: number;
  }[];
  dataThree: {
    month: string;
    number: number;
  }[];
};

export type NewPatientsDataType = {
  month: string;
  number: number;
};

export type CancelVisitDataType = {
  month: string;
  number: number;
};

export type TopDoctorDataType = {
  id: number;
  name: string;
  speciality: string;
  profile_pic: string;
  rating: string;
  scheduled: boolean;
};

export type UpcomingAppointmentType = {
  id: number;
  name: string;
  speciality: string;
  profile_pic: string;
  appointmentTime: string;
  appointmentDate: string;
};

export type NotificationDataType = {
  id: number;
  title: string;
  time: string;
  color: string;
};

export type RecentPatientDataType = {
  id: string;
  name: string;
  profile_pic: string;
  gender: string;
  weight: string;
  assignedDr: string;
  date: string;
  status: string;
  color: string;
};

export type HospitalActivityDataType = {
  name: string;
  Consultations: number;
  Patients: number;
};

export type BloodCardType = {
  id: number;
  name: string;
  icon: string;
  measurement: string;
  color: string;
};

export type AppointmentCardsType = {
  id: number;
  name: string;
  value: string;
  icon: string;
  chartValue: string;
  chartTime: string;
  chartData: {
    month: string;
    users: number;
  }[];
  color: string;
};

export type HeartCardType = {
  id: number;
  title: string;
  measurement: string;
  unit: string;
  graphData: {
    name: string;
    rate: number;
  }[];
  color: string;
};

export type DosesType = {
  id: number;
  value: string;
  name: string;
  icon: string;
  bgColor?: string;
};

export type YourActivityDataType = {
  day: string;
  Visits: number;
};

export type ActivityType = {
  id: number;
  srcImg: string;
  name: string;
  value: any;
};

export type HealthCareType = {
  activities: ActivityType[];
  salesState: DrStateType[];
  heathStatics: HeathStaticsDataType;
  newPatients: NewPatientsDataType[];
  cancelVisits: CancelVisitDataType[];
  topDoctors: TopDoctorDataType[];
  upcomingAppointment: UpcomingAppointmentType[];
  notifications: NotificationDataType[];
  hospitalStatics: DosesType[];
  recentPatients: RecentPatientDataType[];
  hospitalActivity: HospitalActivityDataType[];
  bloodCard: BloodCardType[];
  appointmentCards: AppointmentCardsType[];
  heartCard: HeartCardType;
  temperatureCard: HeartCardType;
  doses: DosesType[];
  yourActivity: YourActivityDataType[];
};
