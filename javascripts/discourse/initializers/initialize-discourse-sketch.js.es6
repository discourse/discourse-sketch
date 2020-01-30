import loadScript from "discourse/lib/load-script";
import WidgetGlue from "discourse/widgets/glue";
import { getRegister } from "discourse-common/lib/get-owner";
import { withPluginApi } from "discourse/lib/plugin-api";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default {
  name: "discourse-sketch",

  initialize() {
    withPluginApi("0.8.7", api => {
      let _glued = [];

      function cleanUp() {
        _glued.forEach(g => g.cleanUp());
        _glued = [];
      }

      function _attachWidget(api, container, options) {
        const glue = new WidgetGlue(
          "discourse-sketch",
          getRegister(api),
          options
        );
        glue.appendTo(container);
        _glued.push(glue);
      }

      function _attachSketches($elem, id = 1) {
        const $sketches = $(".d-wrap[data-wrap=sketch]", $elem);

        if (!$sketches.length) {
          return;
        }

        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/rough.js/3.1.0/rough.js"
        ).then(() => {
          $sketches.each((idx, sketch) => {
            _attachWidget(api, sketch, {
              id: `${id}-${idx}`
            });
          });
        });
      }

      function _attachPostWithSketches($elem, helper) {
        if (helper) {
          const post = helper.getModel();
          api.preventCloak(post.id);
          _attachSketches($elem, post.id);
        }
      }

      api.decorateCooked(_attachPostWithSketches, {
        id: "discourse-sketch"
      });

      api.cleanupStream(cleanUp);
    });
  }
};
