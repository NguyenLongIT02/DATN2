/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import { Avatar, Button, Col, Form, Input, Select } from "antd";

import AppRowContainer from "@crema/components/AppRowContainer";
import {
  StyledMultiSelect,
  StyledMultiSelectName,
  StyledScrumBoardAddCardForm,
  StyledScrumBoardAddCardFormContent,
  StyledScrumBoardAddCardFormFooter,
  StyledScrumBoardDatePicker,
  StyledScrumBoardScrollbar,
} from "./index.styled";
import { postDataApi, putDataApi, deleteDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { jwtAxios } from "@crema/services/auth/jwt-auth";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  showCardCreatedNotification,
  showCardUpdatedNotification,
  showOperationErrorNotification,
} from "@crema/helpers/NotificationHelper";

import CardComments from "./CardComments";
import CardCheckedList from "./CardCheckedList";
import CardDependencies from "./CardDependencies";
import type {
  BoardObjType,
  CardListObjType,
  CardObjType,
  LabelObjType,
  MemberObjType,
} from "@crema/types/models/apps/ScrumbBoard";
import { generateRandomUniqueNumber } from "@crema/helpers/Common";

const { Option } = Select;
const { TextArea } = Input;

type AddCardFormProps = {
  board: BoardObjType;
  list: CardListObjType | null;
  handleCancel: () => void;
  comments: any[];
  checkedList: any[];
  setCheckedList: (list: any[]) => void;
  values?: any;
  setFieldValue?: (name: string, value: any) => void;
  setComments: (comments: any[]) => void;
  selectedLabels: LabelObjType[];
  setSelectedLabels: (lables: LabelObjType[]) => void;
  selectedMembers: MemberObjType[];
  setMembersList: (members: MemberObjType[]) => void;
  selectedCard: CardObjType | null;
  onCloseAddCard: () => void;
  isSubmitting?: boolean;
  setData?: (data: BoardObjType) => void;
  refreshTrigger?: number;
  canManageBoard?: boolean;
  authUser?: any;
};

const AddCardForm: React.FC<AddCardFormProps> = ({
  board,
  list,
  handleCancel,
  comments,
  setComments,
  checkedList,
  setCheckedList,
  selectedLabels,
  setSelectedLabels,
  selectedMembers,
  setMembersList,
  selectedCard,
  onCloseAddCard,
  authUser,
  isSubmitting,
  setData,
  refreshTrigger,
  canManageBoard = true,
}) => {
  const { messages } = useIntl();
  const [form] = Form.useForm();
  const infoViewActionsContext = useInfoViewActionsContext();
  
  const mockLabelList: LabelObjType[] = [
    { id: 1, name: "Lỗi", type: 1, color: "#f44336" },
    { id: 2, name: "Tính năng", type: 2, color: "#2196f3" },
    { id: 3, name: "Cải tiến", type: 3, color: "#4caf50" },
    { id: 4, name: "Khẩn cấp", type: 4, color: "#FFA07A" },
    { id: 5, name: "Ưu tiên cao", type: 5, color: "#e91e63" },
    { id: 6, name: "Ưu tiên thấp", type: 6, color: "#607d8b" },
  ];

  const labelList = mockLabelList;
  const [{ apiData: rawMemberData, loading: loadingMembers }, { reCallAPI: refreshMembers }] =
    useGetDataApi<any>(`/scrumboard/member/${board.id}`, []);

  const memberList = React.useMemo(() => {
    if (!rawMemberData) return [];

    if (rawMemberData.data && Array.isArray(rawMemberData.data)) {
      return rawMemberData.data.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        lastActive: member.lastActive,
        boards: member.boards || 0,
        tasks: member.tasks || 0,
        role: member.role,
        joinedAt: member.joinedAt,
      }));
    }

    if (Array.isArray(rawMemberData)) {
      return rawMemberData.map((member: any) => ({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        lastActive: member.lastActive,
        boards: member.boards || 0,
        tasks: member.tasks || 0,
        role: member.role,
        joinedAt: member.joinedAt,
      }));
    }

    return [];
  }, [rawMemberData]);

  useEffect(() => {
    if (refreshMembers) {
      refreshMembers();
    }
  }, [board.id]);

  useEffect(() => {
    if (refreshMembers && refreshTrigger && refreshTrigger > 0) {
      refreshMembers();
    }
  }, [refreshTrigger]);

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      date:
        values.date && dayjs.isDayjs(values.date)
          ? values.date
          : values.date
            ? dayjs(values.date, "MM-DD-YYYY")
            : null,
    };

    const laneId = list?.id;
    if (laneId === undefined || laneId === null) {
      const operation = selectedCard ? "update card" : "create card";
      showOperationErrorNotification(operation, "Cannot determine target list");
      return;
    }

    if (selectedCard) {
      const safeMembers = Array.isArray(selectedMembers) ? selectedMembers : [];
      const safeLabels = Array.isArray(selectedLabels) ? selectedLabels : [];

      putDataApi<BoardObjType>(
        "/scrumboard/edit/card",
        infoViewActionsContext,
        {
          id: selectedCard.id,
          title: values.title || "",
          description: values.desc || "",
          date: values.date || "",
          laneId,
          memberIds: safeMembers.map((member: any) => member.id),
          labelIds: safeLabels.map((label: any) => label.id),
        }
      )
        .then(() => {
          const updatedBoard = {
            ...board,
            list: (board.list || []).map((ln) => {
              if (ln.id !== laneId) return ln;
              const safeCards = Array.isArray(ln.cards) ? ln.cards : [];
              const updatedCards = safeCards.map((c) =>
                c.id === selectedCard.id
                  ? {
                    ...c,
                    title: values.title || "",
                    desc: values.desc || "",
                    date: values.date || "",
                    members: safeMembers,
                    label: safeLabels,
                  }
                  : c
              );
              return { ...ln, cards: updatedCards };
            }),
          } as BoardObjType;
          setData!(updatedBoard);
          handleCancel();
          showCardUpdatedNotification(values.title || "Card");
        })
        .catch((error) => {
          showOperationErrorNotification("update card", error.message);
        });
    } else {
      const safeComments = Array.isArray(comments) ? comments : [];
      const safeMembers = Array.isArray(selectedMembers) ? selectedMembers : [];
      const safeLabels = Array.isArray(selectedLabels) ? selectedLabels : [];

      const newCard = {
        id: generateRandomUniqueNumber(),
        checkedList: Array.isArray(checkedList) ? checkedList : [],
        comments: safeComments,
        ...formattedValues,
        label: safeLabels,
        members: safeMembers,
      };
      
      postDataApi<{ id: number } | unknown>(
        "/scrumboard/add/card",
        infoViewActionsContext,
        {
          title: values.title || "",
          description: values.desc || "",
          date: values.date || "",
          laneId,
          memberIds: safeMembers.map((member: any) => member.id),
          labelIds: safeLabels.map((label: any) => label.id),
          checklistItems: Array.isArray(checkedList) ? checkedList.map(item => item.title) : [],
        }
      )
        .then((resp) => {
          const createdId = (resp as any)?.id || newCard.id;
          const createdCard = { ...newCard, id: createdId };

          const updatedBoard = {
            ...board,
            list: (board.list || []).map((ln) => {
              if (ln.id !== laneId) return ln;
              const safeCards = Array.isArray(ln.cards) ? ln.cards : [];
              return { ...ln, cards: [...safeCards, createdCard] };
            }),
          } as BoardObjType;
          setData!(updatedBoard);

          setComments([]);
          setSelectedLabels([]);
          setMembersList([]);

          handleCancel();
          showCardCreatedNotification(values.title || "Card");
        })
        .catch((error) => {
          showOperationErrorNotification("create card", error.message);
        });
    }
  };
  
  const onAddNewComment = (comment: string) => {
    if (!comment || !selectedCard) return;

    postDataApi("/scrumboard/comments", infoViewActionsContext, {
      cardId: selectedCard.id,
      content: comment,
    })
      .then((data) => {
        const newComment = data as any;
        setComments([...comments, newComment]);
      })
      .catch((error) => {
        showOperationErrorNotification("add comment", error.message);
      });
  };

  const onDeleteComment = (commentId: number) => {
    jwtAxios.delete(`/scrumboard/comments/${commentId}`)
      .then(() => {
        setComments(prev => prev.filter(c => c.id !== commentId));
      })
      .catch((error) => {
        showOperationErrorNotification("xóa bình luận", error.message);
      });
  };

  const updateLabelList = (values: any) => {
    const safeLabelList = Array.isArray(labelList) ? labelList : [];
    const safeValues = Array.isArray(values) ? values.map(v => Number(v)) : [];
    setSelectedLabels(
      safeLabelList.filter((label: LabelObjType) =>
        safeValues.includes(Number(label.id))
      )
    );
  };

  const updateMemberList = (values: any) => {
    const safeMemberList = Array.isArray(memberList) ? memberList : [];
    const safeValues = Array.isArray(values) ? values.map(v => Number(v)) : [];
    setMembersList(
      safeMemberList.filter((member: MemberObjType) =>
        safeValues.includes(Number(member.id))
      )
    );
  };

  const parseCardDate = (date: any) => {
    if (!date) return null;
    if (dayjs.isDayjs(date)) return date;
    const parsed = dayjs(date, "MM-DD-YYYY", true);
    if (parsed.isValid()) return parsed;
    const fallback = dayjs(date);
    return fallback.isValid() ? fallback : null;
  };

  const initialValues = useMemo(
    () => ({
      title: selectedCard?.title || "",
      desc: selectedCard?.desc || "",
      date: selectedCard?.date ? parseCardDate(selectedCard.date) : null,
      label: Array.isArray(selectedCard?.label)
        ? selectedCard.label.map((data) => Number(data.id))
        : [],
      members: Array.isArray(selectedCard?.members)
        ? selectedCard.members.map((data) => Number(data.id))
        : [],
    }),
    [
      selectedCard?.title,
      selectedCard?.desc,
      selectedCard?.date,
      selectedCard?.label,
      selectedCard?.members,
    ]
  );

  return (
    <StyledScrumBoardAddCardForm
      form={form}
      noValidate
      autoComplete="off"
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <StyledScrumBoardScrollbar>
        <StyledScrumBoardAddCardFormContent>
          <AppRowContainer>
            <Col xs={24} md={16}>
              <Form.Item name="title">
                <Input
                  placeholder={messages["common.title"] as string}
                  disabled={!canManageBoard}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="date">
                <StyledScrumBoardDatePicker
                  key={`date-picker-${selectedCard?.id || "new"}`}
                  format="MM/DD/YYYY"
                  placeholder="Chọn ngày"
                  allowClear
                  disabled={!canManageBoard}
                  disabledDate={(current) => {
                    if (!current) return false;
                    const tooEarly = board.startDate ? current < dayjs(board.startDate).startOf("day") : false;
                    const tooLate = board.endDate ? current > dayjs(board.endDate).endOf("day") : false;
                    return tooEarly || tooLate;
                  }}
                />
              </Form.Item>
            </Col>
          </AppRowContainer>

          <Form.Item name="desc">
            <TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              placeholder={messages["common.description"] as string}
              disabled={!canManageBoard}
            />
          </Form.Item>

          <AppRowContainer>
            <Col xs={24} lg={12}>
              <Form.Item name="label">
                <Select
                  mode="multiple"
                  allowClear
                  maxTagCount={3}
                  style={{ width: "100%" }}
                  placeholder="Chọn nhãn"
                  onChange={(value) => updateLabelList(value)}
                  disabled={!canManageBoard}
                >
                  {Array.isArray(labelList) &&
                    labelList.map((label: LabelObjType) => {
                      if (!label || !label.id) return null;
                      return (
                        <Option key={label.id} value={label.id}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span 
                              style={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: label.color, 
                                marginRight: 8,
                                display: 'inline-block' 
                              }} 
                            />
                            {label.name}
                          </div>
                        </Option>
                      );
                    })}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} lg={12}>
              <Form.Item name="members">
                <Select
                  mode="multiple"
                  maxTagCount={2}
                  placeholder="Chọn thành viên"
                  onChange={(value) => updateMemberList(value)}
                  disabled={!canManageBoard}
                >
                  {Array.isArray(memberList) && memberList.length > 0 ? (
                    memberList.map((member: MemberObjType) => {
                      if (!member || !member.id || !member.name) return null;
                      return (
                        <Option key={member.id} value={member.id}>
                          <StyledMultiSelect>
                            {member.avatar ? (
                              <Avatar src={member.avatar} />
                            ) : (
                              <Avatar>{member.name.toUpperCase()}</Avatar>
                            )}
                            <StyledMultiSelectName>
                              {member.name}
                            </StyledMultiSelectName>
                          </StyledMultiSelect>
                        </Option>
                      );
                    })
                  ) : (
                    <Option disabled value="loading-or-empty">
                      <div style={{ textAlign: "center", padding: "8px" }}>
                        {loadingMembers ? "Loading members..." : "No members assigned to this board"}
                      </div>
                    </Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </AppRowContainer>

          {/* Dependencies Section */}
          {selectedCard && (
            <CardDependencies
              cardId={selectedCard.id}
              boardId={board.id}
              currentDependencyIds={selectedCard.dependencies || []}
              disabled={!canManageBoard}
            />
          )}

          <CardCheckedList
            cardId={selectedCard?.id || 0}
            checkedList={checkedList}
            setCheckedList={setCheckedList}
          />

          {selectedCard && (
            <CardComments
              comments={comments}
              currentUserId={authUser?.id}
              onAddNewComment={onAddNewComment}
              onDeleteComment={onDeleteComment}
            />
          )}
        </StyledScrumBoardAddCardFormContent>
      </StyledScrumBoardScrollbar>
      <StyledScrumBoardAddCardFormFooter>
        <Button type="primary" ghost onClick={onCloseAddCard}>
          <IntlMessages id="common.cancel" />
        </Button>
        {canManageBoard && (
          <Button type="primary" disabled={isSubmitting} htmlType="submit">
            <IntlMessages id="common.done" />
          </Button>
        )}
      </StyledScrumBoardAddCardFormFooter>
    </StyledScrumBoardAddCardForm>
  );
};
export default AddCardForm;
