/**
 * Provides the component that displays the aggregation of SLOs by defined Org.
 *
 * @file
 * @author Gil Rice
 */
/** core */
import React from 'react';
import PropTypes from 'prop-types';
/** nr1 */
import {
  Button,
  BlockText,
  Grid,
  GridItem,
  PlatformStateContext,
  Spinner,
  Stack,
  StackItem,
  Dropdown
} from 'nr1';

/** local */
import OrganizationSelector from '../org-selector';
import OrganizationSummary from '../org-displayer';

/** 3rd party */
import { fetchSloDocuments } from '../../../shared/services/slo-documents';

/**
 * SLOREstate
 */
export default class SLOREstate extends React.Component {
  static propTypes = {
    entities: PropTypes.array
    // fetchMore: PropTypes.object
  }; // propTypes

  constructor(props) {
    super(props);

    this.state = {
      organizationOptions: [],
      allDocuments: [],
      orgDocuments: [],
      selectedOrg: null
    }; // state

    this.sloSelectorCallback = this._sloSelectorCallback.bind(this);
  } // constructor

  componentDidMount() {
    this.fetchDocuments();
  } // componentDidMount

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.allDocuments === null) {
      return true;
    } // if

    if (this.state.allDocuments !== nextState.allDocuments) {
      return true;
    }

    if (this.state.selectedOrg !== nextState.selectedOrg) {
      return true;
    } // if

    return false;
  } // shouldComponentUpdate

  // componentDidUpdate(prevProps) {
  //   //
  // }

  _sloSelectorCallback(_org) {
    const { allDocuments } = this.state;

    const orgDocuments = allDocuments.filter(slo => slo.orgName === _org);
    // console.debug(orgDocuments);

    this.setState({ selectedOrg: _org, orgDocuments });
  } // _sloSelectorCallback

  async fetchDocuments() {
    const { entities } = this.props;

    entities.forEach(entity => {
      const { guid: entityGuid } = entity;
      fetchSloDocuments({ entityGuid }).then(result => this.addEntity(result));
    });
  }

  addEntity(entity) {
    if (entity.length === 0) {
      return;
    }

    entity.forEach(slo => {
      this.addSlo(slo);
    });
  }

  addSlo(slo) {
    const { allDocuments, organizationOptions } = this.state;
    const organization = slo.document.organization;

    const newState = {
      allDocuments: [
        ...allDocuments,
        {
          id: slo.id,
          orgName: slo.document.organization,
          slo: slo.document
        }
      ]
    };

    if (!organizationOptions.includes(organization)) {
      newState.organizationOptions = [...organizationOptions, organization];
    }

    this.setState(newState);
  }

  renderNoneDefined() {
    return (
      <StackItem>
        <BlockText>
          Unable to find any SLOs defined. Use the Entity Explorer to find a
          Service and define an SLO.
        </BlockText>
      </StackItem>
    );
  }

  renderNoOrganizationSelected() {
    const { organizationOptions, selectedOrg } = this.state;

    return (
      <>
        <Stack
          className="no-org-selected-container empty-state-container"
          directionType={Stack.DIRECTION_TYPE.VERTICAL}
          horizontalType={Stack.HORIZONTAL_TYPE.CENTER}
          verticalType={Stack.VERTICAL_TYPE.CENTER}
        >
          <StackItem>
            <h3 className="empty-state-header">Choose an organization</h3>
            <p className="empty-state-description">
              Select an organaization from the dropdown to get started.
            </p>
          </StackItem>
          <StackItem className="org-selector">
            <OrganizationSelector
              orgs={organizationOptions}
              onChange={this.sloSelectorCallback}
              selectedOrg={selectedOrg}
              showLabel={false}
              title="Choose an organization"
            />
          </StackItem>
        </Stack>
      </>
    );
  }

  render() {
    const { entities } = this.props;
    const { organizationOptions, orgDocuments, selectedOrg } = this.state;
    const orgWithSlos = {
      orgName: selectedOrg,
      slos: orgDocuments
    };

    return (
      <>
        <Stack
          className="summary-toolbar toolbar-container"
          fullWidth
          gapType={Stack.GAP_TYPE.NONE}
          horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}
          verticalType={Stack.VERTICAL_TYPE.FILL}
        >
          <StackItem className="toolbar-section1">
            <Stack
              gapType={Stack.GAP_TYPE.NONE}
              fullWidth
              verticalType={Stack.VERTICAL_TYPE.FILL}
            >
              <StackItem className="toolbar-item has-separator">
                <OrganizationSelector
                  orgs={organizationOptions}
                  onChange={this.sloSelectorCallback}
                  selectedOrg={selectedOrg}
                />
              </StackItem>
            </Stack>
          </StackItem>
          <StackItem className="toolbar-section2">
            <Stack
              fullWidth
              fullHeight
              verticalType={Stack.VERTICAL_TYPE.CENTER}
              horizontalType={Stack.HORIZONTAL_TYPE.RIGHT}
            >
              <StackItem>
                <Button
                  onClick={() => alert('You clicked me!')}
                  type={Button.TYPE.PRIMARY}
                >
                  Primary button
                </Button>
              </StackItem>
            </Stack>
          </StackItem>
        </Stack>
        <Grid
          className={`primary-grid ${
            !this.state.selectedOrg ? 'empty-state-parent' : ''
          }`}
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem className="primary-content-container" columnSpan={12}>
            {/* No organization selected */}
            {!this.state.selectedOrg && this.renderNoOrganizationSelected()}

            {/* Org selected but loading */}
            {this.state.selectedOrg && this.state.allDocuments === null && (
              <Spinner />
            )}

            {/* Org selected but no results */}
            {this.state.selectedOrg &&
              this.state.allDocuments.length < 1 &&
              this.renderNoneDefined()}

            <StackItem>
              {this.state.selectedOrg && (
                <PlatformStateContext.Consumer>
                  {launcherUrlState => (
                    <OrganizationSummary
                      org={orgWithSlos}
                      timeRange={launcherUrlState.timeRange}
                    />
                  )}
                </PlatformStateContext.Consumer>
              )}
              {!this.state.selectedOrg && <></>}
            </StackItem>
          </GridItem>
        </Grid>
      </>
    );
  } // render
} // SLOREstate
