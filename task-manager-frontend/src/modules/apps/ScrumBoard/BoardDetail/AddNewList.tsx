import React, {useState} from 'react';
import IntlMessages from '@crema/helpers/IntlMessages';
import {RiCloseLine} from 'react-icons/ri';
import {MdAdd} from 'react-icons/md';
import {Input, Select} from 'antd';
import {useIntl} from 'react-intl';
import AppIconButton from '@crema/components/AppIconButton';
import {WorkflowStatus} from '@crema/constants/WorkflowConstants';
import {
  StyledScrumBoardAddClose,
  StyledScrumBoardAddIcon,
  StyledScrumBoardAddList,
  StyledScrumBoardAddListBtn,
  StyledScrumBoardAddListCard,
  StyledScrumBoardAddListFormFilled,
  StyledScrumBoardAddText,
} from './index.styled';

const {Option} = Select;

type AddNewListProps = {
  onAdd: (listName: string, statusType?: string) => void;
  onCancel: () => void;
};

const AddNewList: React.FC<AddNewListProps> = ({onAdd, onCancel}) => {
  const [listName, setListName] = useState('');
  const [statusType, setStatusType] = useState<string>(WorkflowStatus.NONE);

  const onClickAddButton = () => {
    if (listName !== '') {
      onAdd(listName, statusType);
      setListName('');
      setStatusType(WorkflowStatus.NONE);
    }
  };

  const {messages} = useIntl();

  return (
    <StyledScrumBoardAddListCard>
      <StyledScrumBoardAddList>
        <StyledScrumBoardAddIcon>
          <MdAdd />
        </StyledScrumBoardAddIcon>
        <StyledScrumBoardAddText>
          <IntlMessages id='scrumboard.addAList' />
        </StyledScrumBoardAddText>
        <StyledScrumBoardAddClose>
          <AppIconButton onClick={onCancel} icon={<RiCloseLine />} />
        </StyledScrumBoardAddClose>
      </StyledScrumBoardAddList>
      <StyledScrumBoardAddListFormFilled>
        <Input
          placeholder={messages['scrumboard.cardTitle'] as string}
          value={listName}
          onChange={(event) => setListName(event.target.value)}
          style={{marginBottom: 8}}
        />
        <Select
          value={statusType}
          onChange={setStatusType}
          style={{width: '100%', marginBottom: 8}}
          placeholder="Workflow type"
        >
          <Option value={WorkflowStatus.NONE}>None</Option>
          <Option value={WorkflowStatus.TODO}>To Do</Option>
          <Option value={WorkflowStatus.IN_PROGRESS}>In Progress</Option>
          <Option value={WorkflowStatus.DONE}>Done</Option>
        </Select>
        <StyledScrumBoardAddListBtn
          type='primary'
          ghost
          onClick={() => onClickAddButton()}
        >
          <IntlMessages id='common.add' />
        </StyledScrumBoardAddListBtn>
      </StyledScrumBoardAddListFormFilled>
    </StyledScrumBoardAddListCard>
  );
};

export default AddNewList;
