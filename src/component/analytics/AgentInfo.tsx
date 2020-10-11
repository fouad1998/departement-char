import { ArrowBack, Call, Feedback, Message, MissedVideoCall, PhoneMissed, Stars, VideoCall } from '@material-ui/icons';
import { Button, Col, Row, Select } from 'antd';
import React from 'react';
import QuickReply from '../../icons/quickreply';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import * as d3 from 'd3';
import { agentInfo, timeHumainForm } from '../../utils/func';
import { timeDay } from 'd3';

export interface AgentInfoProps {}

const { Option } = Select;

const AgentInfo: React.FC<AgentInfoProps> = () => {
  const svgRef = React.useMemo(() => React.createRef<SVGSVGElement>(), []);
  const tooltipRef = React.useMemo(() => React.createRef<HTMLDivElement>(), []);

  React.useEffect(() => {
    const svg = svgRef.current;
    const tooltip = tooltipRef.current;
    const agent = agentInfo();
    // Padding between svg edges & graphs
    const padding = { top: 0, bottom: 20, left: 10, right: 10, info: { top: 0 } };

    const height = 200;
    const width = 400;

    if (svg) {
      const HTMLTemplate = (agentName: string, startsTime: string, endsTime: string): string => {
        const template = `
        <div id="agent-tooltip">
         <div id="agent-name">{{agent-name}}</div>
         <div id="agent-working-info">
         <div id="starts">{{starts}}</div>
         <div id="splitter"><hr id="hr" /></div>
         <div id="ends" >{{ends}}</div>
         </div>
         </div>
         `
          .replace('{{agent-name}}', agentName)
          .replace('{{starts}}', startsTime)
          .replace('{{ends}}', endsTime);

        return template;
      };

      const drawWidth = width - padding.left - padding.right;

      const xScale = d3
        .scaleLinear()
        .domain([0, 24 * 3600])
        .range([0, drawWidth]);

      //Select the SVG with d3 and remove all his content
      const svgD3Selection = d3.select(svg);
      svgD3Selection.html(` <defs>
      <linearGradient id="Gradient1" x1="0" x2="0" y1="0" y2="3">
        <stop class="stop1" offset="0%"/>
        <stop class="stop2" offset="50%"/>
        <stop class="stop3" offset="100%"/>
      </linearGradient>
      <style type="text/css"><![CDATA[
        #rect1 { fill: url(#Gradient1); }
        .stop1 { stop-color: rgb(107, 204, 248,  0.54); }
        .stop2 { stop-color: rgb(98, 201, 248, 0.72); stop-opacity: 0; }
        .stop3 { stop-color: rgb(79, 195, 247); }
      ]]></style>
  </defs>`);

      // Create all x, y Axis
      const xAxisGroup = svgD3Selection
        .append('g')
        .attr('id', 'x-agent-axis')
        .call(
          d3
            .axisBottom(xScale)
            .tickValues([0, 3 * 3600, 6 * 3600, 9 * 3600, 12 * 3600, 15 * 3600, 18 * 3600, 21 * 3600, 24 * 3600])
            .tickFormat((seconds: d3.NumberValue): string => {
              const eachHours = 3600 * 3;
              if (seconds.valueOf() % eachHours === 0) {
                return (seconds.valueOf() / 3600).toString() + 'hr';
              }
              return '';
            })
            .tickSizeOuter(0)
        );
      xAxisGroup.attr('transform', `translate(${padding.left}, ${height - padding.bottom})`).attr('font-size', '13');

      const shapeGroup = svgD3Selection.append('g').attr('transform', `translate(${padding.left}, 0)`);
      const drawHeight = height - padding.top - padding.bottom;
      shapeGroup
        .selectAll('rect')
        .data(agent.workingTime)
        .enter()
        .append('rect')
        .attr('x', time => xScale(time.startTime) as number)
        .attr('width', time => (xScale(time.endTime) as number) - (xScale(time.startTime) as number))
        .attr('y', 0)
        .attr('height', drawHeight)
        .attr('time-starts', time => timeHumainForm(time.startTime))
        .attr('time-ends', time => timeHumainForm(time.endTime))
        .attr('time-starts-seconds', time => time.startTime)
        .attr('time-ends-seconds', time => time.endTime)
        .attr('fill', 'url(#Gradient1)')
        .on('mouseover', function () {
          const startsTime = this.getAttribute('time-starts') as string;
          const endsTime = this.getAttribute('time-ends') as string;

          tooltip!.innerHTML = HTMLTemplate(agent.name, startsTime, endsTime);
          tooltip!.style.display = 'block';
        })
        .on('mousemove', function () {
          const startsTime = +(this.getAttribute('time-starts-seconds') as string);
          const endsTime = +(this.getAttribute('time-ends-seconds') as string);
          // SVG DOM Dimension
          const dimension = svg.getBoundingClientRect();

          // scale in DOM mouse coord
          const xScaleMouseCoord = dimension.width / width;
          const yScaleMouseCoord = dimension.height / height;

          const mouseCoord = d3.mouse(this);
          let mouseX = this.getBoundingClientRect().x - dimension.x;
          mouseX = mouseX > dimension.width - 150 ? mouseX - 250 : mouseX;

          const mouseY = mouseCoord[1];

          tooltip!.style.top = `${mouseY * yScaleMouseCoord - 20}px`;
          tooltip!.style.left = `${mouseX + ((xScale(endsTime) as number) - (xScale(startsTime) as number)) * xScaleMouseCoord}px`;
        })
        .on('mouseleave', function () {
          tooltip!.style.display = 'none';
        });
    }
  }, [svgRef, tooltipRef]);

  return (
    <Row>
      <div className="agent-bar">
        <ArrowBack onClick={() => {}} />
      </div>
      <Col span={24} className="agent-info-sub-container">
        <Row>
          {/** Title */}
          <Col span={24}>
            <Row>
              <Col span={24} className="agent-title">
                <h2>Agent Availability</h2>
              </Col>
            </Row>
          </Col>

          {/** Agent Rate */}
          <Col span={14} className="agent-rates">
            <Row>
              <Col span={8} className="rate-attribute">
                <Row>
                  <Col span={12} className="unit">
                    3.2
                  </Col>
                  <Col span={12} className="icon">
                    <Stars style={{ color: 'yellow' }} />
                  </Col>
                </Row>
              </Col>
              <Col span={8} className="rate-attribute">
                <Row>
                  <Col span={12} className="unit with-metric">
                    3.2
                    <span className="metric">min</span>
                  </Col>
                  <Col span={12} className="icon">
                    <QuickReply style={{ color: 'red', fill: 'red' }} />
                  </Col>
                </Row>
              </Col>
              <Col span={8} className="rate-attribute">
                <Row>
                  <Col span={12} className="unit with-metric">
                    3.2<span className="metric">Hours</span>
                  </Col>
                  <Col span={12} className="icon">
                    <CalendarTodayIcon style={{ color: 'green' }} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          {/** Agent graph demo & agent switcher (agent / period) */}
          <Col span={24}>
            <Row>
              <Col span={14} style={{ position: 'relative' }}>
                <svg ref={svgRef} viewBox="0 0 400 200" />
                <div className="tooltip" ref={tooltipRef}></div>
              </Col>
              <Col span={10}>
                <Row style={{ height: '100%' }}>
                  <Col span={24}>
                    <Row className="agent-switcher">
                      <Col span={24} className="title">
                        Agent
                      </Col>
                      <Col span={24} className="switcher">
                        <Select style={{ width: '100%' }} defaultValue="James">
                          <Option value="James">James</Option>
                          <Option value="Look">Look</Option>
                          <Option value="Steve">Steve</Option>
                          <Option value="Diego">Diego</Option>
                          <Option value="Hamza">Hamza</Option>
                        </Select>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={24}>
                    <Row className="agent-switcher">
                      <Col span={24} className="title">
                        In/On
                      </Col>
                      <Col span={24} className="switcher">
                        <Select style={{ width: '100%' }} defaultValue="today">
                          <Option value="today">Today</Option>
                          <Option value="last-week">Last week</Option>
                          <Option value="last-month">Last month</Option>
                          <Option value="last-year">Last year</Option>
                          <Option value="from-begining">From begining</Option>
                        </Select>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          {/** Bref summury about agent on different fields */}
          <Col span={14}>
            <Row className="agent-attributes">
              <Col span={24}>
                <Row>
                  <Col span={8}>
                    <Row className="agent-attribute">
                      <Col className="icon" span={8}>
                        <span className="help">
                          <VideoCall style={{ color: 'green' }} />
                          <span className="help-content">Number of video calls made</span>
                        </span>
                      </Col>
                      <Col className="value" span={8}>
                        3201
                      </Col>
                      <Col className="progress" span={8}>
                        87
                        <span className="percent">%</span>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Row className="agent-attribute">
                      <Col className="icon" span={8}>
                        <span className="help">
                          <MissedVideoCall style={{ color: 'red' }} />
                          <span className="help-content">Number of missed and rejected video calls</span>
                        </span>
                      </Col>
                      <Col className="value" span={8}>
                        7021
                      </Col>
                      <Col className="progress" span={8}>
                        75
                        <span className="percent">%</span>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Row className="agent-attribute">
                      <Col className="icon" span={8}>
                        <span className="help">
                          <Message style={{ color: '#4fc3f7' }} />
                          <span className="help-content">Number of messages wrote</span>
                        </span>
                      </Col>
                      <Col className="value" span={8}>
                        780
                      </Col>
                      <Col className="progress" span={8}>
                        450
                        <span className="percent">%</span>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row>
                  <Col span={8}>
                    <Row className="agent-attribute">
                      <Col className="icon" span={8}>
                        <span className="help">
                          <Call style={{ color: 'green' }} />
                          <span className="help-content">Number of audio calls made</span>
                        </span>
                      </Col>
                      <Col className="value" span={8}>
                        102
                      </Col>
                      <Col className="progress" span={8}>
                        14
                        <span className="percent">%</span>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Row className="agent-attribute">
                      <Col className="icon" span={8}>
                        <span className="help">
                          <PhoneMissed style={{ color: 'red' }} />
                          <span className="help-content">Number of missed and rejected audio calls</span>
                        </span>
                      </Col>
                      <Col className="value" span={8}>
                        400
                      </Col>
                      <Col className="progress" span={8}>
                        21
                        <span className="percent">%</span>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={8}>
                    <Row className="agent-attribute">
                      <Col className="icon" span={8}>
                        <span className="help">
                          <Feedback style={{ color: '#4fc3f7' }} />
                          <span className="help-content">Number of missed messages</span>
                        </span>
                      </Col>
                      <Col className="value" span={8}>
                        150
                      </Col>
                      <Col className="progress" span={8}>
                        10
                        <span className="percent">%</span>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          {/** The buttons to switch agent */}
          <Col span={10} className="buttons-switcher">
            <Row>
              <Col span={12}>
                <Button type="primary" className="button-switcher">
                  Previous <span className="agent-name">(John)</span>
                </Button>
              </Col>
              <Col span={12}>
                <Button type="primary" className="button-switcher">
                  Next <span className="agent-name">(James)</span>
                </Button>
              </Col>
            </Row>
          </Col>

          {/** More details */}
          <Row>
            <Col span={24} className="more-details-container">
              More details
            </Col>
          </Row>
        </Row>
      </Col>
    </Row>
  );
};

export default AgentInfo;
