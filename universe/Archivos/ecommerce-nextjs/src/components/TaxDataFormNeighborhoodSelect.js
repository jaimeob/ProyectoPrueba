import { Component } from "react"

import { Grid, Select, FormControl, Typography } from "@material-ui/core"

export default class TaxDataFormNeighborhoodSelect extends Component {
  render() {
    const { onChange, neighborhoods = [], currentNeighborhood } = this.props
    return (
      <Grid item xs={6}>
        <FormControl style={{ width: "100%" }}>
          <Typography variant="body1">
            <strong>Colonia</strong>
          </Typography>
          <Select native onChange={onChange}>
            <option value={null}>Seleccione una colonia...</option>

            {neighborhoods.length > 0
              ? neighborhoods.map((neighborhood, idx) => (
                  <option value={idx} {...(currentNeighborhood?.name === neighborhood.name ? { selected: " " } : {})}>
                    {neighborhood.name}
                  </option>
                ))
              : ""}
          </Select>
        </FormControl>
      </Grid>
    )
  }
}
