import React, { Component } from 'react'
import { connect } from 'react-redux'
import compose from 'recompose/compose'
import { withRouter } from 'react-router-dom'

// Material UI
import { withTheme, withStyles } from '@material-ui/core/styles'
import { Grid, Typography } from '@material-ui/core'

// Components
import Title from '../components/Title'
import KPICard from '../components/KPICard'

// Utils
import Utils from '../resources/Utils'
import { requestAPI } from '../api/CRUD'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const styles = (theme) => ({})

class Dashboard extends Component {
  constructor(props) {
    super(props)

    let startDate = new Date()
    startDate.setDate(1)

    let endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    endDate.setDate(0)

    this.state = {
      name: '',
      firstLastName: '',
      secondLastName: '',
      dashboard: [],
      startDate: startDate,
      endDate: endDate,
      daily: null,
      monthDate: null,
      year: null
    }

    this.setStartDate = this.setStartDate.bind(this)
    this.setEndDate = this.setEndDate.bind(this)
    this.loadData = this.loadData.bind(this)
    this.newDaily = this.newDaily.bind(this)
    this.setMonth = this.setMonth.bind(this)
    this.changeYear = this.changeYear.bind(this)
  }

  setStartDate(date) {
    const self = this
    this.setState(
      {
        startDate: date
      },
      () => {
        self.loadData()
      }
    )
  }

  setEndDate(date) {
    const self = this
    this.setState(
      {
        endDate: date
      },
      () => {
        self.loadData()
      }
    )
  }

  async loadData() {
    let month = this.state.startDate.getMonth() + 1
    let startDate = this.state.startDate.getFullYear() + '-' + month + '-' + this.state.startDate.getDate()
    month = this.state.endDate.getMonth() + 1
    let endDate = this.state.endDate.getFullYear() + '-' + month + '-' + this.state.endDate.getDate()
    let query = 'init=' + startDate + '&end=' + endDate
    if (this.state.daily !== null) {
      query = query + '&daily=' + this.state.daily
    }
    if (this.state.monthDate !== null) {
      query = query + '&month=' + this.state.monthDate
    }
    if (this.state.year !== null) {
      query = query + '&year=' + this.state.year
    }

    let dashboard = await requestAPI({
      method: 'GET',
      host: Utils.constants.HOST,
      resource: 'homes',
      endpoint: '/dashboard?' + query
    })

    this.setState({
      dashboard: dashboard.data,
      daily: (dashboard.data !== undefined && dashboard.data !== undefined && dashboard.data !== null && dashboard.data.length > 0 && dashboard.data[0].daily !== null && dashboard.data[0].daily !== undefined) ? dashboard.data[0].daily : null,
      monthDate: (dashboard.data !== undefined && dashboard.data !== undefined && dashboard.data !== null && dashboard.data.length > 0 && dashboard.data[1].month !== null && dashboard.data[1].month !== undefined) ? dashboard.data[1].month : null,
      year: (dashboard.data !== undefined && dashboard.data !== undefined && dashboard.data !== null && dashboard.data.length > 0 && dashboard.data[2].name !== null && dashboard.data[2].name !== undefined) ? dashboard.data[2].name : null,
    })

  }

  async newDaily(number) {
    let daily = new Date(this.state.daily)
    daily.setDate(daily.getDate() + number)
    let initDay = daily.getDate()
    let initMonth = daily.getMonth() + 1
    let initYear = daily.getFullYear()
    await this.setState({
      daily: initYear + '-' + initMonth + '-' + initDay
    })
    await this.loadData()
  }

  async setMonth(number) {
    var month = new Date()
    if (this.state.monthDate !== null) {
      month = new Date(this.state.monthDate)
    }
    month.setMonth(month.getMonth() + number)

    let initMonth = month.getMonth() + 1
    let initYear = month.getFullYear()
    await this.setState({
      monthDate: initYear + '-' + initMonth + '-1'
    })
    await this.loadData()
  }

  async changeYear(number) {
    console.log('Number', number)
    console.log('Year state', this.state.year)
    var year = new Date()
    let initYear = null
    if (this.state.year !== null) {
      year = new Date(this.state.year)
      initYear = Number(year.getFullYear())
      console.log('here', initYear);
    } else {
      initYear = Number(year.getFullYear())
      console.log('here2', initYear);
    }
    if (number === 1) {
      initYear = initYear + 1
    } else {
      initYear = initYear - 1
    }
    await this.setState({
      year: initYear
    })
    console.log(this.state)
    await this.loadData()
  }

  async componentWillMount() {
    if (Utils.app().modules.Dashboard) {
    }
    const self = this
    if (Utils.isUserLoggedIn()) {
      let user = await Utils.getCurrentUser()
      this.setState(
        {
          name: user.name,
          firstLastName: user.firstLastName,
          secondLastName: user.secondLastName
        },
        () => {
          self.loadData()
        }
      )
    } else {
      Utils.logout()
      this.props.history.push('/')
    }
  }

  render() {
    let myModule = null
    if (Utils.app().modules !== null) {
      myModule = Utils.app().modules.Dashboard
    } else {
      window.location.reload()
    }

    return (
      <div>
        <Title title={'Hola, ' + this.state.name + ' ' + this.state.firstLastName} description='Bienvenido al backoffice de GRUPO CALZAPATO S.A. DE C.V.' />
        <Grid container>
          <Grid sm={4} style={{ marginTop: 16 }}>
            <strong>Fecha inicio: </strong>
            <DatePicker
              selected={this.state.startDate}
              onChange={(date) => {
                this.setStartDate(date)
              }}
              showYearPicker={false}
              showMonthYearPicker={false}
              showFullMonthYearPicker={true}
            />
          </Grid>
          <Grid sm={4} style={{ marginTop: 16 }}>
            <strong>Fecha fin: </strong>
            <DatePicker
              selected={this.state.endDate}
              onChange={(date) => {
                this.setEndDate(date)
              }}
              showYearPicker={false}
              showMonthYearPicker={false}
              showFullMonthYearPicker={true}
            />
          </Grid>
        </Grid>
        {myModule !== undefined && myModule !== null && myModule.permissions !== null && myModule.permissions !== undefined && myModule.permissions.read ? (
          <Grid container>
            {this.state.dashboard.map((metric) => {
              return (
                <>
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                    <h3 style={{ marginBottom: 8 }}>{metric.name}</h3>
                    <span>{metric.description}</span>
                  </Grid>
                  {metric.kpis.map((kpi) => {
                    if (kpi.status) {
                      return (
                        <Grid item xl={kpi.grid} lg={kpi.grid} md={kpi.grid} sm={6} xs={12}>
                          {metric.chart !== undefined && metric.chart !== null && metric.chart === 'year' ? (
                            <KPICard
                              title={kpi.title}
                              description={kpi.description}
                              value={kpi.value}
                              arrows={kpi.arrows ? kpi.arrows : false}
                              list={kpi.list !== undefined ? kpi.list : []}
                              type={kpi.type !== undefined ? kpi.type : null}
                              blockArrow={metric.name === 'Hoy' || metric.block ? true : false}
                              chart={metric.chart !== undefined ? metric.chart : undefined}
                              setDaily={(number) => {
                                this.changeYear(number)
                              }}
                            />
                          ) : (
                            <KPICard
                              title={kpi.title}
                              description={kpi.description}
                              value={kpi.value}
                              arrows={kpi.arrows ? kpi.arrows : false}
                              list={kpi.list !== undefined ? kpi.list : []}
                              type={kpi.type !== undefined ? kpi.type : null}
                              blockArrow={metric.name === 'Hoy' || metric.block ? true : false}
                              chart={metric.chart !== undefined ? metric.chart : undefined}
                              setDaily={
                                metric.chart !== undefined
                                  ? (number) => {
                                      this.setMonth(number)
                                    }
                                  : (number) => {
                                      this.newDaily(number)
                                    }
                              }
                            />
                          )}
                        </Grid>
                      )
                    }
                  })}
                  <Grid item xl={12} lg={12} md={12} sm={12} xs={12} style={{ marginTop: 24 }}>
                    <hr style={{ opacity: 0.3 }} />
                  </Grid>
                </>
              )
            })}
          </Grid>
        ) : (
          ''
        )}
      </div>
    )
  }
}

export default compose(withRouter, withTheme(), withStyles(styles), connect(null, null))(Dashboard)
