import { Row, Col, Select } from 'antd';
import * as React from 'react';
import * as d3 from 'd3';
import { getRandomDataDepartement, departementState, roundToHumainValue, selectMax, selectElementAccumulate, selectElement } from '../../utils/func';
import '../../scss/departementStack.scss';
import { departementStackedGraphReducer } from './reducer';
import DepartementInfo from './DepartementInfo';

const { Option } = Select;

export interface DepartementStackedGraphProps {}

const DepartementStackedGraph: React.FC<DepartementStackedGraphProps> = () => {
  const [period, setPeriod] = React.useState<string>('Today');
  const [state, dispatch] = React.useReducer(departementStackedGraphReducer, {
    transferredChat: '',
    unansweredChat: '',
    answeredChat: '',
    missedChat: '',
    departementName: '',
    hover: false,
    seeDepartementInfo: false,
    departementID: '',
  });

  const svgRef = React.useMemo(() => React.createRef<SVGSVGElement>(), []);
  const tooltipRef = React.useMemo(() => React.createRef<HTMLDivElement>(), []);

  React.useEffect(() => {
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
      const departementsState = getRandomDataDepartement(Math.ceil(Math.random() * 0xf + 5));
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
      // SVG DOM Dimension
      const dimesion = svg.getBoundingClientRect();

      // Max value in dataset
      const firstMax = d3.max(departementsState, (departement: departementState) => departement.answeredChat) as number;
      const secondMax = d3.max(departementsState, (departement: departementState) => departement.unansweredChat) as number;
      const thirdMax = d3.max(departementsState, (departement: departementState) => departement.transferredChat) as number;
      const fourthMax = d3.max(departementsState, (departement: departementState) => departement.missedChat) as number;
      const yMax = firstMax + secondMax + thirdMax + fourthMax;

      // Domains
      const drawWidth = width - padding.left - padding.right - margin.left * departementsState.length - margin.right * departementsState.length;
      console.log(drawWidth);
      const xScale = d3
        .scaleBand()
        .domain(departementsState.map(d => d.name))
        .range([0, drawWidth]);
      const xAxisScale = d3
        .scaleBand()
        .domain(departementsState.map(d => d.name))
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
          .data(departementsState)
          .enter()
          .append('rect')
          .attr('x', (_: any, index: number) => index * xScale.bandwidth() + margin.left * (index + 1) + margin.right * index)
          //@ts-ignore
          .attr('y', d => {
            const base = height - padding.bottom;
            const index = n === numberOfProperty ? numberOfProperty - 1 : n;
            const heightOfBar = yScale(selectElementAccumulate(d, index, colors).value) as number;
            return base - heightOfBar;
          })
          .attr('width', xScale.bandwidth())
          .attr('height', (d: departementState) => {
            const index = n === numberOfProperty ? numberOfProperty - 1 : n;
            console.log(index);
            const barAccumulate = yScale(selectElementAccumulate(d, index, colors).value) as number;
            const previousAccumulate = n > 0 && n < numberOfProperty ? (yScale(selectElementAccumulate(d, n - 1, colors).value) as number) : 0;
            return barAccumulate - previousAccumulate;
          })
          .attr('fill', (d: departementState) => (n === numberOfProperty ? 'transparent' : selectElement(d, n, colors).color))
          .attr('departement-name', d => d.name)
          .attr('departement-unanswered', d => d.unansweredChat)
          .attr('departement-answered', d => d.answeredChat)
          .attr('departement-missed', d => d.missedChat)
          .attr('departement-transferred', d => d.transferredChat)
          .attr('departement-active-bar', d => (n === numberOfProperty ? '' : selectElement(d, n, colors).key))
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

            dispatch({
              type: 'SET_ALL',
              value: {
                transferredChat: departementTransferred,
                unansweredChat: departementUnanswered,
                answeredChat: departementAnswered,
                missedChat: departementMissed,
                departementName: departementName,
                hover: true,
              },
            });

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
            dispatch({
              type: 'SET_ALL',
              value: {
                transferredChat: '',
                unansweredChat: '',
                answeredChat: '',
                missedChat: '',
                departementName: '',
                hover: false,
              },
            });
          })
          .on('click', function () {
            //TODO: ADD THE DEPARTEMENT ID
            dispatch({
              type: 'SET_SELECTED_DEPARTEMENT',
              value: {
                seeDepartementInfo: true,
                departementID: '',
              },
            });
          })
          .classed(`max-level-${n} ` + (n === -1 ? 'container' : ''), true);
      }
    }

    return () => {};
  }, [svgRef, tooltipRef, period]);

  const returnMainScreen = React.useCallback(
    () =>
      dispatch({
        type: 'SET_SELECTED_DEPARTEMENT',
        value: {
          seeDepartementInfo: false,
          departementID: '',
        },
      }),
    []
  );

  return (
    <Row>
      <Col span={18}>
        <svg ref={svgRef} style={{ height: '100%', width: '100%' }} viewBox="0 0 500 300"></svg>
        <div className="tooltip" ref={tooltipRef}></div>
      </Col>
      <Col span={6} style={{ height: 'inherit', padding: '10px 15px 10px 10px' }}>
        <Row style={{ height: '100%' }}>
          <Col span={24} style={{ height: '50%', padding: '10px 0', boxSizing: 'border-box' }}>
            <Col span={24} style={{ padding: '10px 0' }}>
              <h3>Departement stats</h3>
            </Col>
            <Col span={24}>
              <strong>In/On</strong>
              <br />
              <Select defaultValue="Today" style={{ width: '100%' }} onChange={(value: string) => setPeriod(value)}>
                {['Today', 'Yesterday', 'Last week', 'Last month', 'Last year', 'From begining'].map(period => (
                  <Option key={period} value={period}>
                    {period}
                  </Option>
                ))}
              </Select>
            </Col>
          </Col>
          {state.hover && (
            <Col span={24} className="information" style={{ height: '50%' }}>
              <Col span={24} className="info-property">
                <strong>Departement Name:</strong> <span>{state.departementName}</span>
              </Col>
              <Col span={24}>
                <Col span={24} className="info-property">
                  <strong>Answered Chat:</strong> <span>{state.answeredChat}</span>
                </Col>
                <Col span={24} className="info-property">
                  <strong>Unanswered Chat:</strong> <span>{state.unansweredChat}</span>
                </Col>
                <Col span={24} className="info-property">
                  <strong>Missed Chat:</strong> <span>{state.missedChat}</span>
                </Col>
                <Col span={24} className="info-property">
                  <strong>Transferred Chat:</strong> <span>{state.transferredChat}</span>
                </Col>
              </Col>
            </Col>
          )}
        </Row>
      </Col>
      {state.seeDepartementInfo && (
        <div className="departement-container">
          <div className="margin" onClick={returnMainScreen}></div>
          <DepartementInfo departementID={'dzad'} returnMainScreen={returnMainScreen} />
        </div>
      )}
    </Row>
  );
};

export default DepartementStackedGraph;
