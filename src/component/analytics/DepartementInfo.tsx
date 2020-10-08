import { ArrowBack, CallMissed, CancelScheduleSend, Group, QuestionAnswer, TransferWithinAStation } from '@material-ui/icons';
import { Col, Row } from 'antd';
import HelpIcon from '@material-ui/icons/Help';
import React from 'react';
import { departementInfo, roundToHumainValue } from '../../utils/func';
import * as d3 from 'd3';

export interface DepartementInfoProps {
  readonly departementID: string;
  readonly returnMainScreen: () => void;
}

const DepartementInfo: React.FC<DepartementInfoProps> = props => {
  const { returnMainScreen, departementID } = props;
  //TODO: Add Way to download the data
  const departement = departementInfo();

  const svgRef = React.useMemo(() => React.createRef<SVGSVGElement>(), []);

  React.useEffect(() => {
    const svg = svgRef.current;

    // Padding between svg edges & graphs
    const padding = { top: 10, bottom: 20, left: 70, right: 20, info: { top: 0 } };

    // Margin betweenBars
    const margin = { left: 7, right: 7 };

    const height = 260;
    const width = 350;

    // Colors
    const colors = ['#2196F3', '#FF1744', '#00E676', '#FF9800'];

    const values = [departement.answeredChat, departement.unansweredChat, departement.transferredChat, departement.missedChat];

    if (svg) {
      //Select the SVG with d3 and remove all his content
      const svgD3Selection = d3.select(svg);
      svgD3Selection.html('');

      // Max
      const yMax = d3.max(values) as number;

      // Domains
      const drawWidth = width - padding.left - padding.right - margin.left * 4 - margin.right * 4;
      console.log(drawWidth);
      const xScale = d3.scaleBand().domain(['Answered Chat', 'Unanswered Chat', 'Transferred Chat', 'Missed Chat']).range([0, drawWidth]);
      const xAxisScale = d3
        .scaleBand()
        .domain(['Answered Chat', 'Unanswered Chat', 'Transferred Chat', 'Missed Chat'])
        .range([0, width - padding.left - padding.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, roundToHumainValue(yMax)])
        .range([0, height - padding.bottom - padding.top - padding.info.top]);

      // Create all x, y Axis
      const xAxisGroup = svgD3Selection.append('g').attr('id', 'x-axis-departement').call(d3.axisBottom(xAxisScale));
      xAxisGroup.attr('transform', `translate(${padding.left}, ${height - padding.bottom})`).attr('font-size', '7');

      const yAxisGroup = svgD3Selection
        .append('g')
        .attr('id', 'y-axis')
        .call(
          d3.axisLeft(
            d3
              .scaleLinear()
              .domain([roundToHumainValue(yMax), 0])
              .range([0, height - padding.bottom - padding.top - padding.info.top])
          )
        );
      yAxisGroup.attr('transform', `translate(${padding.left}, ${padding.top + padding.info.top})`).attr('font-size', '7');

      const groupBarsD3 = svgD3Selection.append('g').attr('transform', `translate(${padding.left}, 0)`);
      groupBarsD3
        .selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('x', (_: any, index: number) => index * xScale.bandwidth() + margin.left * (index + 1) + margin.right * index)
        .attr('y', d => {
          const calc = yScale(d) as number;
          return height - padding.bottom - calc;
        })
        .attr('width', xScale.bandwidth())
        .attr('height', (d: number) => yScale(d) as number)
        .attr('fill', (_, index) => colors[index]);
    }
  }, [svgRef]);

  return (
    <Row style={{ height: '100vh', width: '100%' }} className="departement-info-sub-container">
      <div className="departement-bar">
        <ArrowBack onClick={returnMainScreen} />
      </div>
      <Col span={24} className="departement-info-content">
        <Col span={24} className="departement-title">
          <h2>{departement.name}</h2>
        </Col>
        <Row className="departement-info-properties-container">
          <Col span={12}>
            <div className="departement-info-properties">
              <div className="departement-info-property">
                <span className="icon">
                  <QuestionAnswer />
                </span>
                <span className="value">
                  {departement.answeredChat}
                  <span className="help">
                    <HelpIcon />
                    <span className="help-content">Answered chat</span>
                  </span>
                </span>
              </div>
              <div className="departement-info-property">
                <span className="icon">
                  <TransferWithinAStation />
                </span>
                <span className="value">
                  {departement.transferredChat}
                  <span className="help">
                    <HelpIcon />
                    <span className="help-content"></span>
                  </span>
                </span>
              </div>
              <div className="departement-info-property">
                <span className="icon">
                  <CallMissed />
                </span>
                <span className="value">
                  {departement.missedChat}
                  <span className="help">
                    <HelpIcon />
                    <span className="help-content"></span>
                  </span>
                </span>
              </div>
              <div className="departement-info-property">
                <span className="icon">
                  <CancelScheduleSend />
                </span>
                <span className="value">
                  {departement.unansweredChat}
                  <span className="help">
                    <HelpIcon />
                    <span className="help-content"></span>
                  </span>
                </span>
              </div>
              <div className="departement-info-property">
                <span className="icon">
                  <Group />
                </span>
                <span className="value">
                  {departement.departementSize}
                  <span className="help">
                    <HelpIcon />
                    <span className="help-content"></span>
                  </span>
                </span>
              </div>
            </div>
          </Col>
          <Col span={10}>
            <svg ref={svgRef} viewBox="0 0 350 260"></svg>
          </Col>
        </Row>

        <Col span={24} className="agents-info">
          <Col span={24} className="agent-info-content">
            <Col span={12} className="agent-name">
              Agent name
            </Col>
            <Col span={6} className="agent-answered">
              Answered
            </Col>
            <Col span={6} className="agent-assigned">
              Assigned
            </Col>
          </Col>
          {departement.agents.map((agent, ii) => (
            <Col span={24} className="agent-info-content" key={ii}>
              <Col span={12} className="agent-name">
                {agent.name}
              </Col>
              <Col span={6} className="agent-answered">
                {agent.answered}
              </Col>
              <Col span={6} className="agent-assigned">
                {agent.assigned}
              </Col>
            </Col>
          ))}
        </Col>
      </Col>
    </Row>
  );
};

export default DepartementInfo;
