import styled from 'styled-components';

export const MapLayout = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  .map-head {
    margin-bottom: 20px;
  }
  .map-side {
    /* position: absolute;
    top: 0;
    left: 0;
    right: 0; */
    z-index: 9;
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    width: 300px;
    width: 100%;
    height: auto;
    padding: 10px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.6);
  }
  .map-content {
    position: relative;
    z-index: 8;
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .map-form {
    z-index: 9;
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    width: 300px;
    width: 100%;
    height: auto;
    padding: 10px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.6);
  }
  .ant-form {
    width: 100%;
    .ant-form-item {
      width: 30%;
      margin-bottom: 16px;
      &:last-child {
        width: 5%;
        margin-right: 0;
      }
    }
  }

  .map-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    min-width: 800px;
    min-height: 600px;
  }
`;
