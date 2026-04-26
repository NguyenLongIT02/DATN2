import { List, Switch, Tag } from "antd";
import styled from "styled-components";
import IntlMessages from "@crema/helpers/IntlMessages";

type AutomationRule = {
  id: number;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
};

type AutomationRuleItemProps = {
  rule: AutomationRule;
  onToggle: (id: number, enabled: boolean) => void;
};

const StyledRuleItem = styled(List.Item)`
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  .rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .rule-description {
    color: #8c8c8c;
    margin-bottom: 12px;
  }

  .rule-details {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;

    .detail-item {
      flex: 1;

      .label {
        font-size: 12px;
        color: #8c8c8c;
        margin-bottom: 4px;
      }

      .value {
        font-size: 14px;
        color: #262626;
      }
    }
  }

  .rule-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;

    .meta {
      font-size: 12px;
      color: #bfbfbf;
    }
  }
`;

const AutomationRuleItem = ({ rule, onToggle }: AutomationRuleItemProps) => {
  return (
    <StyledRuleItem>
      <div style={{ width: "100%" }}>
        <div className="rule-header">
          <h4>
            <IntlMessages id={rule.name} />
          </h4>
          <Tag color={rule.enabled ? "green" : "default"}>
            <IntlMessages
              id={
                rule.enabled
                  ? "automation.status.active"
                  : "automation.status.inactive"
              }
            />
          </Tag>
        </div>

        <div className="rule-description">
          <IntlMessages id={rule.description} />
        </div>

        <div className="rule-details">
          <div className="detail-item">
            <div className="label">
              <IntlMessages id="automation.trigger" />
            </div>
            <div className="value">
              <IntlMessages id={rule.trigger} />
            </div>
          </div>
          <div className="detail-item">
            <div className="label">
              <IntlMessages id="automation.action" />
            </div>
            <div className="value">
              <IntlMessages id={rule.action} />
            </div>
          </div>
        </div>

        <div className="rule-footer">
          <div className="meta">
            <IntlMessages
              id="automation.createdBy"
              values={{ createdBy: rule.createdBy, createdAt: rule.createdAt }}
            />
          </div>
          <Switch
            checked={rule.enabled}
            onChange={(checked) => onToggle(rule.id, checked)}
          />
        </div>
      </div>
    </StyledRuleItem>
  );
};

export default AutomationRuleItem;
