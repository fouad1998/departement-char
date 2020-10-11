import { ArrowBack, CallMissed, CancelScheduleSend, Group, QuestionAnswer, TransferWithinAStation } from '@material-ui/icons';
import { Col, Row } from 'antd';
import HelpIcon from '@material-ui/icons/Help';
import React from 'react';
import { agentInformationInterface, departementInfo, roundToHumainValue, selectElement, selectElementAccumulate } from '../../utils/func';
import * as d3 from 'd3';
import { agentInfoReducer } from './reducer';
import AgentInfo from './AgentInfo';

export interface DepartementInfoProps {
  readonly departementID: string;
  readonly returnMainScreen: () => void;
}

const DepartementInfo: React.FC<DepartementInfoProps> = props => {
  const { returnMainScreen, departementID } = props;

  const [state, dispatch] = React.useReducer(agentInfoReducer, {
    agentID: 10212,
    displayAgentInfo: false,
    transferredChat: '',
    unansweredChat: '',
    answeredChat: '',
    missedChat: '',
    departementName: '',
    hover: false,
    seeDepartementInfo: false,
    departementID: '',
    agents: [],
    departementSize: 0,
  });

  const svgRef = React.useMemo(() => React.createRef<SVGSVGElement>(), []);
  const tooltipRef = React.useMemo(() => React.createRef<HTMLDivElement>(), []);

  React.useEffect(() => {
    //TODO: Add Way to download the data
    const departement = departementInfo();
    const agents = departement.agents;
    dispatch({
      type: 'SET_ALL',
      action: {
        ...departement,
        departementName: departement.name,
      },
    });
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;

    // config
    // Padding between svg edges & graphs
    const padding = { top: 10, bottom: 50, left: 100, right: 70, info: { top: 30 } };

    // Margin betweenBars
    const margin = { left: 2, right: 2 };

    const height = 300;
    const width = 500;

    const rectInfo = { width: 10, height: 7, titleWidth: 70, titleMarignLeft: 5, titleMarginTop: 7, groupLeft: 20, groupTop: 10 };

    // Colors
    const colors = {
      answeredChat: '#2196F3',
      unansweredChat: '#FF1744',
      transferredChat: '#00E676',
      missedChat: '#FF9800',
    };

    if (svg) {
      // utils
      const HTMLTemplate = (
        departementName: string,
        bar: string,
        answered: string,
        unanswered: string,
        transferred: string,
        missed: string
      ): string => {
        const template = `
         <div id="departement-name">Departement name: {{departement-name}}</div>
         <div id="info-state">
         <div id="answered" class="{{answeredChat}}">Answered chat: <span>{{answered}}</span></div>
         <div id="unanswered" class="{{unansweredChat}}">Unanswered chat: <span>{{unanswered}}<span></div>
         <div id="transferred" class="{{transferredChat}}">Transferred chat: <span>{{transferred}}</span></div>
         <div id="missed" class="{{missedChat}}">Missed chat: <span>{{missed}}</span></div>
         </div>
         `
          .replace('{{departement-name}}', departementName)
          .replace('{{answered}}', answered)
          .replace('{{unanswered}}', unanswered)
          .replace('{{transferred}}', transferred)
          .replace('{{missed}}', missed)
          .replace(`{{${bar}}}`, 'active');

        return template;
      };

      // Max value in dataset
      const firstMax = d3.max(agents, agent => agent.answeredChat) as number;
      const secondMax = d3.max(agents, agent => agent.unansweredChat) as number;
      const thirdMax = d3.max(agents, agent => agent.transferredChat) as number;
      const fourthMax = d3.max(agents, agent => agent.missedChat) as number;
      const yMax = firstMax + secondMax + thirdMax + fourthMax;

      // Domains
      const drawWidth = width - padding.left - padding.right - margin.left * agents.length - margin.right * agents.length;
      console.log(drawWidth);
      const xScale = d3
        .scaleBand()
        .domain(agents.map(a => a.name))
        .range([0, drawWidth]);
      const xAxisScale = d3
        .scaleBand()
        .domain(agents.map(a => a.name))
        .range([0, width - padding.left - padding.right]);

      const yScale = d3
        .scaleLinear()
        .domain([0, roundToHumainValue(yMax)])
        .range([0, height - padding.bottom - padding.top - padding.info.top]);

      //Select the SVG with d3 and remove all his content
      const svgD3Selection = d3.select(svg);
      svgD3Selection.html('');

      // Create all x, y Axis
      const xAxisGroup = svgD3Selection.append('g').attr('id', 'x-axis').call(d3.axisBottom(xAxisScale));
      xAxisGroup.attr('transform', `translate(${padding.left}, ${height - padding.bottom})`).attr('font-size', '5');

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

      // Information band
      const infoGroup = svgD3Selection.append('g');
      const rectContent = [
        { title: 'Answered', key: 'answeredChat' },
        { title: 'Unanswered', key: 'unansweredChat' },
        { title: 'Transferred', key: 'transferredChat' },
        { title: 'Missed', key: 'missedChat' },
      ];

      infoGroup.attr('transform', `translate(${padding.left + rectInfo.groupLeft}, ${padding.top + rectInfo.groupTop})`).attr('font-size', '10');

      const groupStacksD3 = svgD3Selection.append('g').attr('transform', `translate(${padding.left}, 0)`);
      const numberOfProperty = 4;
      for (let n = 0; n <= numberOfProperty; ++n) {
        if (n !== numberOfProperty) {
          infoGroup
            .append('rect')
            .attr('x', n * (rectInfo.width + rectInfo.titleWidth + rectInfo.titleMarignLeft))
            .attr('width', rectInfo.width)
            .attr('height', rectInfo.height)
            //@ts-ignore
            .attr('fill', colors[rectContent[n].key] as string);
          infoGroup
            .append('text')
            .attr('x', (n + 1) * (rectInfo.width + rectInfo.titleMarignLeft) + n * rectInfo.titleWidth)
            .attr('y', rectInfo.titleMarginTop)
            //@ts-ignore
            .attr('fill', colors[rectContent[n].key] as string)
            .text(rectContent[n].title);
        }

        groupStacksD3
          .selectAll(`rect.max-level-${n}`)
          .data(agents)
          .enter()
          .append('rect')
          .attr('x', (_: any, index: number) => index * xScale.bandwidth() + margin.left * (index + 1) + margin.right * index)
          //@ts-ignore
          .attr('y', a => {
            const base = height - padding.bottom;
            const index = n === numberOfProperty ? numberOfProperty - 1 : n;
            const heightOfBar = yScale(selectElementAccumulate(a, index, colors).value) as number;
            return base - heightOfBar;
          })
          .attr('width', xScale.bandwidth())
          .attr('height', a => {
            const index = n === numberOfProperty ? numberOfProperty - 1 : n;
            console.log(index);
            const barAccumulate = yScale(selectElementAccumulate(a, index, colors).value) as number;
            const previousAccumulate = n > 0 && n !== numberOfProperty ? (yScale(selectElementAccumulate(a, n - 1, colors).value) as number) : 0;
            return barAccumulate - previousAccumulate;
          })
          .attr('fill', a => (n === numberOfProperty ? 'transparent' : selectElement(a, n, colors).color))
          .attr('departement-name', a => a.name)
          .attr('departement-unanswered', a => a.unansweredChat)
          .attr('departement-answered', a => a.answeredChat)
          .attr('departement-missed', a => a.missedChat)
          .attr('departement-transferred', a => a.transferredChat)
          .attr('departement-active-bar', a => (n === numberOfProperty ? '' : selectElement(a, n, colors).key))
          .on('mouseover', function () {
            const departementName = this.getAttribute('departement-name') as string;
            const departementUnanswered = this.getAttribute('departement-unanswered') as string;
            const departementAnswered = this.getAttribute('departement-answered') as string;
            const departementMissed = this.getAttribute('departement-missed') as string;
            const departementTransferred = this.getAttribute('departement-transferred') as string;
            const departementActiveBar = this.getAttribute('departement-active-bar') as string;

            tooltip!.innerHTML = HTMLTemplate(
              departementName,
              departementActiveBar,
              departementAnswered,
              departementUnanswered,
              departementTransferred,
              departementMissed
            );

            // dispatch({
            //   type: 'SET_ALL',
            //   value: {
            //     transferredChat: departementTransferred,
            //     unansweredChat: departementUnanswered,
            //     answeredChat: departementAnswered,
            //     missedChat: departementMissed,
            //     departementName: departementName,
            //     hover: true,
            //   },
            // });

            if (n === numberOfProperty) {
              //make indicator of highlighting
              this.setAttribute('stroke', 'black');
              this.setAttribute('stroke-width', '2');
            }

            tooltip!.style.display = 'block';
          })
          .on('mousemove', function () {
            // SVG DOM Dimension
            const dimension = svg.getBoundingClientRect();

            // scale in DOM mouse coord
            const xScaleMouseCoord = dimension.width / width;
            const yScaleMouseCoord = dimension.height / height;

            const mouseCoord = d3.mouse(this);
            let mouseX = this.getBoundingClientRect().x - dimension.x;
            mouseX = mouseX > dimension.width - 250 ? mouseX - 300 : mouseX;

            const mouseY = mouseCoord[1];

            tooltip!.style.top = `${mouseY * yScaleMouseCoord - 20}px`;
            tooltip!.style.left = `${mouseX + xAxisScale.bandwidth() * xScaleMouseCoord}px`;
          })
          .on('mouseout', function () {
            this.setAttribute('stroke-width', '0');
            tooltip!.style.display = '';
          })
          .on('click', function () {
            console.log('Clicked on bar');
            //TODO: ADD THE Agent ID
            dispatch({
              type: 'SET_ALL',
              value: {
                displayAgentInfo: true,
                agentID: '',
              },
            });
          })
          .classed(`max-level-${n} ` + (n === -1 ? 'container' : ''), true);
      }
    }

    return () => {};
  }, [svgRef, tooltipRef]);

  //const agentClickHandle = React.useCallback(() => {});

  return (
    <Row style={{ height: '100vh', width: '100%' }} className="departement-info-sub-container">
      <div className="departement-bar">
        <ArrowBack onClick={returnMainScreen} />
      </div>
      <Col span={24} className="departement-info-content">
        <Row>
          <Col span={24} className="departement-title">
            <h2>{state.departementName}</h2>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <svg ref={svgRef} viewBox="0 0 500 300"></svg>
            <div className="tooltip" ref={tooltipRef}></div>
          </Col>
        </Row>
        <Row style={{ background: 'white', marginBottom: '80px' }}>
          <Col span={24}>
            <h2 style={{ fontVariantCaps: 'all-petite-caps', paddingLeft: 10, fontWeight: 600 }}>Bref summury about the departement & his agents</h2>
          </Col>
          <Col span={24}>
            <Row className="departement-info-properties-container">
              <Col span={12}>
                <div className="departement-info-properties">
                  <div className="departement-info-property">
                    <span className="icon">
                      <QuestionAnswer />
                    </span>
                    <span className="value">
                      {state.answeredChat}
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
                      {state.transferredChat}
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
                      {state.missedChat}
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
                      {state.unansweredChat}
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
                      {state.departementSize}
                      <span className="help">
                        <HelpIcon />
                        <span className="help-content"></span>
                      </span>
                    </span>
                  </div>
                </div>
              </Col>
              <Col span={12} className="agents-info">
                <Col span={24} className="agent-info-content">
                  <Col span={8} className="agent-name">
                    Agent name
                  </Col>
                  <Col span={8} className="agent-answered">
                    Answered
                  </Col>
                  <Col span={8} className="agent-assigned">
                    Assigned
                  </Col>
                </Col>
                {state.agents?.map((agent: agentInformationInterface, ii: number) => (
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
            </Row>
          </Col>
        </Row>
      </Col>
      {/** Agent Information Tab */}
      {state.displayAgentInfo && (
        <div className="agent-container">
          <div className="margin"></div>
          <div className="agent-info-container">
            <AgentInfo />
          </div>
        </div>
      )}
    </Row>
  );
};

export default DepartementInfo;
