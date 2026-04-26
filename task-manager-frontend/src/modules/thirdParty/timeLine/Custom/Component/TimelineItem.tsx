import {
  StyledTime,
  StyledTimeCalendarIcon,
  StyledTimelineCircle,
  StyledTimelineCircleInner,
  StyledTimelineItem,
  StyledTimelineItemContent,
  StyledTimelineItemFooter,
  StyledTimelineItemHeader,
  StyledTimelineLink,
  StyledTimelineTag,
  StyledTimelineText,
} from "../index.styled";
import { DataProps } from "../data";

type Props = {
  data: DataProps;
};

const TimelineItem = (props: Props) => {
  const { data } = props;

  return (
    <StyledTimelineItem>
      <StyledTimelineItemContent>
        <StyledTimelineItemHeader>
          <div>
            <h2>{data.title}</h2>
            <StyledTime>
              <StyledTimeCalendarIcon />
              {data.date}
            </StyledTime>
          </div>
          <StyledTimelineTag
            style={{
              backgroundColor: data.category.color + "25",
              color: data.category.color,
            }}
          >
            {data.category.tag}
          </StyledTimelineTag>
        </StyledTimelineItemHeader>
        <StyledTimelineText>{data.text}</StyledTimelineText>
        <StyledTimelineItemFooter>
          {data.link && (
            <StyledTimelineLink
              href={data.link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.link.text}
            </StyledTimelineLink>
          )}
        </StyledTimelineItemFooter>
        <StyledTimelineCircle>
          <StyledTimelineCircleInner />
        </StyledTimelineCircle>
      </StyledTimelineItemContent>
    </StyledTimelineItem>
  );
};
export default TimelineItem;
