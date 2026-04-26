import { useEffect } from "react";
import AppsContainer from "@crema/components/AppsContainer";
import BoardDetailView from "./BoardDetailView";
import { useNavigate, useParams } from "react-router-dom";
import { StyledScrumBoardDetailTitle } from "./index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";
import { Skeleton } from "antd";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Gọi trực tiếp GET /scrumboard/board/{id}
  const [{ apiData: boardDetail, loading }, { setData }] =
    useGetDataApi<BoardObjType>(
      `/scrumboard/board/${id}`,
      undefined,
      undefined,
      true
    );

  const onGoToBoardList = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <AppsContainer
        fullView
        noContentAnimation
        title={
          <>
            <StyledScrumBoardDetailTitle onClick={onGoToBoardList}>
              Kanban Board
            </StyledScrumBoardDetailTitle>
            &gt; Đang tải...
          </>
        }
      >
        <div style={{ padding: 24 }}>
          <Skeleton active title={{ width: '30%' }} paragraph={{ rows: 4 }} />
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <Skeleton.Button active style={{ width: 280, height: 400 }} />
            <Skeleton.Button active style={{ width: 280, height: 400 }} />
            <Skeleton.Button active style={{ width: 280, height: 400 }} />
          </div>
        </div>
      </AppsContainer>
    );
  }

  // Kiểm tra xem board có tồn tại không
  const boardExists = boardDetail && boardDetail.id;

  if (!boardExists) {
    return (
      <AppsContainer
        fullView
        noContentAnimation
        title={
          <>
            <StyledScrumBoardDetailTitle onClick={onGoToBoardList}>
              Kanban Board
            </StyledScrumBoardDetailTitle>
            &gt; Không tìm thấy bảng
          </>
        }
      >
        <div style={{ padding: 24, textAlign: "center" }}>
          <p>Không tìm thấy bảng hoặc tải thất bại.</p>
          <p>Board ID: {id}</p>
        </div>
      </AppsContainer>
    );
  }

  // Đảm bảo board có cấu trúc list (có thể là array rỗng)
  const boardWithLists = {
    ...boardDetail,
    list: boardDetail.list || [],
  };

  return (
    <AppsContainer
      fullView
      noContentAnimation
      title={
        <>
          <StyledScrumBoardDetailTitle onClick={onGoToBoardList}>
            Kanban Board
          </StyledScrumBoardDetailTitle>
          &gt; {boardDetail?.name}
        </>
      }
    >
      <BoardDetailView boardDetail={boardWithLists} setData={setData} />
    </AppsContainer>
  );
};

export default BoardDetail;
