import $ from "jquery";
import { ajax } from "discourse/lib/ajax";
import loadScript from "discourse/lib/load-script";
import { withPluginApi } from "discourse/lib/plugin-api";
import WidgetGlue from "discourse/widgets/glue";
import { getRegister } from "discourse-common/lib/get-owner";

export default {
  name: "discourse-sketch",

  initialize() {
    withPluginApi("0.8.7", (api) => {
      let _glued = [];

      function cleanUp() {
        _glued.forEach((g) => g.cleanUp());
        _glued = [];
      }

      function _attachWidget(container, options) {
        const glue = new WidgetGlue(
          "discourse-sketch",
          getRegister(api),
          options
        );
        glue.appendTo(container);
        _glued.push(glue);
      }

      function _attachSketches($elem, post) {
        const $sketches = $(".d-wrap[data-wrap=sketch]", $elem);

        if (!$sketches.length) {
          return;
        }

        const id = post.id;

        loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/rough.js/3.1.0/rough.js"
        ).then(() => {
          ajax(`/posts/${id}`, {
            type: "GET",
            cache: false,
          }).then((result) => {
            $sketches.each((idx, sketch) => {
              _attachWidget(sketch, {
                id: `${id}-${idx}`,
                post,
                raw: result.raw,
              });
            });
          });
        });
      }

      function _attachPostWithSketches($elem, helper) {
        if (helper) {
          const post = helper.getModel();
          api.preventCloak(post.id);
          _attachSketches($elem, post);
        }
      }

      api.decorateCooked(_attachPostWithSketches, {
        id: "discourse-sketch",
      });

      api.cleanupStream(cleanUp);
    });
  },
};
