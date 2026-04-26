import React from "react";
import {
  StyledStudentAvatar,
  StyledStudentBadge,
  StyledStudentInfo,
  StyledStudentTableContainer,
  StyledStudentTitle,
} from "../index.styled";
import { StudentRankingDataType } from "@crema/types/models/dashboards/AcademyType";
import type { ColumnsType } from "antd/es/table";

type StudentRankingsProps = {
  studentRankings: StudentRankingDataType[];
};

const StudentRankingsTable: React.FC<StudentRankingsProps> = ({
  studentRankings,
}) => {
  const columns: ColumnsType<StudentRankingDataType> = [
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
      render: (name: any, record) => (
        <StyledStudentInfo>
          <StyledStudentAvatar src={record?.name?.profile_pic} size={40} />
          <StyledStudentTitle>{name.title}</StyledStudentTitle>
        </StyledStudentInfo>
      ),
    },
    {
      title: "Course ID",
      dataIndex: "courseId",
      key: "courseId",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Total Grade",
      dataIndex: "totalGrade",
      key: "totalGrade",
      render: (totalGrade: number) => <span>{totalGrade} point</span>,
    },
    {
      title: "Ranking",
      dataIndex: "ranking",
      key: "ranking",
      render: (ranking: number) => <span>Ranking {ranking}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: number) => (
        <StyledStudentBadge>{category}</StyledStudentBadge>
      ),
    },
  ];

  return (
    <StyledStudentTableContainer
      hoverColor
      data={studentRankings}
      columns={columns}
      pagination={false}
    />
  );
};

export default StudentRankingsTable;
